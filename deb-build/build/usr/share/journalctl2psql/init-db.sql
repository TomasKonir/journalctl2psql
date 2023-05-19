CREATE EXTENSION unaccent;
CREATE EXTENSION pg_trgm;

CREATE TABLE hostname(
	id SERIAL NOT NULL UNIQUE,
	hostname VARCHAR NOT NULL UNIQUE
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

CREATE TABLE journal(
	id BIGSERIAL NOT NULL UNIQUE,
	time TIMESTAMP NOT NULL,
	hostname_id INT NOT NULL REFERENCES hostname(id) ON DELETE CASCADE,
	unit_id INT NOT NULL REFERENCES unit(id) ON DELETE CASCADE,
	identifier_id INT NOT NULL REFERENCES identifier(id) ON DELETE CASCADE,
	facility INT NOT NULL,
	priority INT NOT NULL,
	pid BIGINT NOT NULL,
	message VARCHAR,
	fields JSONB
);
CREATE INDEX journal_hostname_idx ON journal(hostname_id);
CREATE INDEX journal_unit_idx ON journal(unit_id);
CREATE INDEX journal_identifier_idx ON journal(identifier_id);
CREATE INDEX journal_time_idx ON journal(time);
CREATE INDEX journal_hostname_unit_idx ON journal(hostname_id,unit_id,time);

CREATE OR REPLACE FUNCTION unaccent_immutable(text) RETURNS text LANGUAGE sql IMMUTABLE PARALLEL SAFE STRICT AS
$$
	SELECT public.unaccent('public.unaccent', $1)
$$;
CREATE INDEX journal_message_idx ON journal USING GIST (unaccent_immutable(lower(message)) gist_trgm_ops);

DROP FUNCTION IF EXISTS journal_insert(timestamp without time zone,character varying,character varying,character varying,integer,integer,bigint,character varying,jsonb,character varying);
CREATE OR REPLACE FUNCTION journal_insert(t TIMESTAMP, p_hostname VARCHAR, p_unit VARCHAR, p_identifier VARCHAR, facility INT, priority INT, pid BIGINT, message VARCHAR, fields JSONB, p_cursor VARCHAR) RETURNS BIGINT LANGUAGE PLPGSQL SECURITY DEFINER
AS $$
DECLARE return_id     INT;
DECLARE hostname_id   INT;
DECLARE unit_id       INT;
DECLARE identifier_id INT;
DECLARE key_id        INT;
BEGIN
    SELECT id INTO hostname_id FROM hostname WHERE hostname = p_hostname;
    IF hostname_id IS NULL THEN
        INSERT INTO hostname(hostname) VALUES(p_hostname) RETURNING id INTO hostname_id;
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
    INSERT INTO journal(time,hostname_id,unit_id,identifier_id,facility,priority,pid,message,fields) VALUES(t,hostname_id,unit_id,identifier_id,facility,priority,pid,message,fields) RETURNING id INTO return_id;
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

