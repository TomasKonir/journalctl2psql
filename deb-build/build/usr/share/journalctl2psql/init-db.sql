BEGIN;
CREATE EXTENSION unaccent;
CREATE EXTENSION pg_trgm;

CREATE TABLE hostname(
	id SERIAL NOT NULL UNIQUE,
	hostname VARCHAR NOT NULL UNIQUE,
	alias VARCHAR,
	time_offset INT NOT NULL DEFAULT 0
);

CREATE TABLE unit(
	id SERIAL NOT NULL UNIQUE,
	unit VARCHAR NOT NULL UNIQUE
);

CREATE TABLE identifier(
	id SERIAL NOT NULL UNIQUE,
	identifier VARCHAR NOT NULL UNIQUE
);

CREATE TABLE last_cursor(
	hostname VARCHAR NOT NULL UNIQUE REFERENCES hostname(hostname) ON DELETE CASCADE,
	cursor   VARCHAR NOT NULL
);

CREATE TABLE hostname_unit_identifier(
	id SERIAL NOT NULL UNIQUE,
	hostname VARCHAR NOT NULL REFERENCES hostname(hostname) ON DELETE CASCADE,
	unit VARCHAR NOT NULL REFERENCES unit(unit) ON DELETE CASCADE,
	identifier VARCHAR NOT NULL REFERENCES identifier(identifier) ON DELETE CASCADE,
	PRIMARY KEY(hostname,unit,identifier)
);

CREATE SEQUENCE journal_sequence_id;

CREATE TABLE journal(
	time_id UUID NOT NULL UNIQUE,
	hostname_id INT NOT NULL REFERENCES hostname(id) ON DELETE CASCADE,
	unit_id INT NOT NULL REFERENCES unit(id) ON DELETE CASCADE,
	identifier_id INT NOT NULL REFERENCES identifier(id) ON DELETE CASCADE,
	facility INT NOT NULL,
	priority INT NOT NULL,
	pid BIGINT NOT NULL,
	message VARCHAR,
	fields JSONB
) PARTITION BY RANGE (time_id);

CREATE INDEX journal_hostname_idx ON journal(hostname_id);
CREATE INDEX journal_unit_idx ON journal(unit_id);
CREATE INDEX journal_identifier_idx ON journal(identifier_id);
CREATE INDEX journal_time_id_idx ON journal(time_id);
CREATE INDEX journal_hostname_unit_idx ON journal(hostname_id,unit_id,time_id);

CREATE OR REPLACE FUNCTION unaccent_immutable(text) RETURNS text LANGUAGE sql IMMUTABLE PARALLEL SAFE STRICT AS
$$
	SELECT public.unaccent('public.unaccent', $1)
$$;
CREATE INDEX journal_message_idx ON journal USING GIN (unaccent_immutable(lower(message)) gin_trgm_ops);

CREATE OR REPLACE FUNCTION journal_get_next_uuid(t TIMESTAMP) RETURNS UUID LANGUAGE PLPGSQL SECURITY DEFINER
AS $$
BEGIN
	RETURN concat(LPAD(TO_HEX(ROUND(EXTRACT (EPOCH FROM t) * 1000)::BIGINT),12,'0'),'-7000-0000-',LPAD(TO_HEX(NEXTVAL('journal_sequence_id')),12,'0'));
END;
$$;

CREATE OR REPLACE FUNCTION journal_insert(t TIMESTAMP, p_hostname VARCHAR, p_unit VARCHAR, p_identifier VARCHAR, facility INT, priority INT, pid BIGINT, message VARCHAR, fields JSONB, p_cursor VARCHAR) RETURNS UUID LANGUAGE PLPGSQL SECURITY DEFINER
AS $$
DECLARE return_id            UUID;
DECLARE hostname_id          INT;
DECLARE hostname_time_offset INT;
DECLARE unit_id              INT;
DECLARE identifier_id        INT;
DECLARE key_id               INT;
DECLARE partition_id         VARCHAR;
DECLARE partition_exists     BOOLEAN;
DECLARE partition_start      VARCHAR;
DECLARE partition_end        VARCHAR;
BEGIN
    SELECT CONCAT(DATE_PART('YEAR',t),'_',LPAD(DATE_PART('MONTH',t)::VARCHAR,2,'0')) INTO partition_id;
    partition_id := 'journal_' || partition_id;
    SELECT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = partition_id) AS table_existence INTO partition_exists;
    IF partition_exists IS FALSE THEN
        partition_start := CONCAT(LPAD(TO_HEX(ROUND(EXTRACT(EPOCH FROM TO_CHAR(t,'YYYY-MM-01')::DATE) * 1000)::BIGINT),12,'0'),'-0000-0000-000000000000');
        partition_end := CONCAT(LPAD(TO_HEX(ROUND(EXTRACT(EPOCH FROM TO_CHAR(t + interval '1 month','YYYY-MM-01')::DATE) * 1000)::BIGINT),12,'0'),'-FFFF-FFFF-FFFFFFFFFFFF');
        RAISE NOTICE 'Creating partition % from % to %',partition_id,partition_start,partition_end;
        EXECUTE format('CREATE TABLE ' || partition_id || ' PARTITION OF journal FOR VALUES FROM (''' || partition_start || ''') TO (''' || partition_end || ''')');
    END IF;

    SELECT id INTO hostname_id FROM hostname WHERE hostname = p_hostname;
    IF hostname_id IS NULL THEN
        INSERT INTO hostname(hostname) VALUES(p_hostname) RETURNING id INTO hostname_id;
    END IF;

    SELECT time_offset INTO hostname_time_offset FROM hostname WHERE hostname = p_hostname;
    IF hostname_time_offset IS NULL THEN
        hostname_time_offset = 0;
    END IF;

    SELECT id INTO unit_id FROM unit WHERE unit = p_unit;
    IF unit_id IS NULL THEN
        INSERT INTO unit(unit) VALUES(p_unit) RETURNING id INTO unit_id;
    END IF;

    SELECT id INTO identifier_id FROM identifier WHERE identifier = p_identifier;
    IF identifier_id IS NULL THEN
        INSERT INTO identifier(identifier) VALUES(p_identifier) RETURNING id INTO identifier_id;
    END IF;

    SELECT id INTO key_id FROM hostname_unit_identifier WHERE hostname=p_hostname AND unit=p_unit AND identifier=p_identifier;
    IF key_id IS NULL THEN
        INSERT INTO hostname_unit_identifier(hostname,unit,identifier) VALUES(p_hostname,p_unit,p_identifier) RETURNING id INTO key_id;
    END IF;

    INSERT INTO last_cursor(hostname,cursor) VALUES(p_hostname,p_cursor) ON CONFLICT(hostname) DO UPDATE SET cursor = p_cursor;
    INSERT INTO journal(time_id,hostname_id,unit_id,identifier_id,facility,priority,pid,message,fields) VALUES(journal_get_next_uuid(t + (hostname_time_offset || 'minutes')::interval),hostname_id,unit_id,identifier_id,facility,priority,pid,message,fields) RETURNING time_id INTO return_id;
    RETURN return_id;
END;
$$;

GRANT CONNECT ON DATABASE log TO "log-writer";
GRANT SELECT ON last_cursor TO "log-writer";
GRANT EXECUTE ON FUNCTION journal_insert TO "log-writer";

GRANT CONNECT ON DATABASE log TO "log-reader";
GRANT SELECT ON TABLE journal TO "log-reader";
GRANT SELECT ON TABLE hostname TO "log-reader";
GRANT SELECT ON TABLE unit TO "log-reader";
GRANT SELECT ON TABLE identifier TO "log-reader";

--SELECT * FROM journal_get_next_uuid(now()::TIMESTAMP WITHOUT TIME ZONE);
--SELECT * FROM journal_insert(now()::TIMESTAMP WITHOUT TIME ZONE,'hostname','unit','identifier',1,2,3,'message','{}','cursor');
--SELECT * FROM journal_insert(now()::TIMESTAMP WITHOUT TIME ZONE,'hostname','unit','identifier',1,2,3,'message','{}','cursor');
--SELECT * FROM journal_insert(now()::TIMESTAMP WITHOUT TIME ZONE,'hostname','unit','identifier',1,2,3,'message','{}','cursor');
--SELECT * FROM journal;

--DROP TABLE unit,identifier,last_cursor,hostname_unit_identifier,journal,hostname;
--DROP FUNCTION unaccent_immutable;
--DROP FUNCTION journal_insert;
--DROP FUNCTION journal_get_next_uuid;
--DROP SEQUENCE journal_sequence_id;
--DROP EXTENSION pg_trgm;
--DROP EXTENSION unaccent;
COMMIT;
