import React from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import CssBaseline from '@mui/material/CssBaseline'
import 'dayjs/locale/cs'

import { Paper, TextField, Autocomplete, IconButton, Checkbox, Dialog } from '@mui/material'
import ReplayIcon from '@mui/icons-material/Replay'
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft'
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import SettingsIcon from '@mui/icons-material/Settings'
import CheckIcon from '@mui/icons-material/Check'

import DateTimeInput from './DateTimeInput'
import DelayedSearchInput from './DelayedSearchInput'
import NumberInput from './NumberInput'

let develServer = ''
if (window.location.hostname === 'localhost') {
    develServer = 'https://tomas.konir.net/logs/'
}


const theme = createTheme({
    palette: {
        mode: 'dark',
    },
    typography: {
        button: {
            textTransform: 'none'
        },
        "fontFamily": `"Roboto", "Helvetica", "Arial", sans-serif`,
        "fontSize": 12,
        "fontWeightLight": 300,
        "fontWeightRegular": 400,
        "fontWeightMedium": 500
    },
    components: {
        MuiDialogTitle: {
            styleOverrides: {
                root: {
                    color: 'whitesmoke'
                }
            }
        }
    },
})

const limitOptions = [
    { name: "1024", value: 1024 },
    { name: "2048", value: 2048 },
    { name: "8192", value: 8192 },
    { name: "16384", value: 16384 },
    { name: "32768", value: 32768 },
    { name: "65536", value: 65536 },
    { name: "ALL", value: -1 },
]

const pageSize = 1024

export function formatDateTime(ts) {
    if (ts === undefined || ts.length === 0) {
        return ("Neplatný čas")
    }
    ts = ts.replace(" ", "T")
    let ms = Date.parse(ts)
    let t = new Date(ms)//new Date(ms - (new Date(ms).getTimezoneOffset() * 60 * 1000))
    let h = t.getHours()
    let m = t.getMinutes()
    let s = t.getSeconds()
    let ret = ""

    ret += t.getFullYear() + "."
    if (t.getMonth() < 9) {
        ret += "0"
    }
    ret += (t.getMonth() + 1) + "."
    if (t.getDate() < 10) {
        ret += "0"
    }
    ret += t.getDate()


    ret += " "
    if (h < 10) {
        ret += "0"
    }
    ret += h + ":"
    if (m < 10) {
        ret += "0"
    }
    ret += m + ":"
    if (s < 10) {
        ret += "0"
    }
    ret += s

    return (ret)
}

class SettingsDialog extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            currentHost: null,
            currentAlias: '',
            currentTimeOffset: '',
            waiting: false,
        }
    }

    render() {
        let ch = this.state.currentHost
        if (ch === null) {
            ch = {
                alias: '',
                hostname: '',
                time_offset: 0
            }
        }

        if (this.state.waiting) {
            return (<Dialog open={true}>
                <Paper>
                    <img alt='waiting' src='waiting.svg' style={{ width: '8rem', height: '8rem' }} />
                </Paper>
            </Dialog>)
        }
        return (
            <Dialog open={true} onClose={this.props.onClose}>
                <Paper className='flex-column' style={{ minWidth: '20rem', padding: '0.5rem' }}>
                    <Autocomplete
                        fullWidth
                        size='small'
                        options={this.props.hosts}
                        getOptionLabel={option => option.displayname}
                        value={this.state.currentHost}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label='Host'
                                InputProps={{
                                    ...params.InputProps,
                                }}
                            />
                        )}
                        onChange={(event, value) => {
                            let time_offset = '0'
                            let alias = ''
                            if (value !== null) {
                                alias = value.alias
                                time_offset = value.time_offset
                                if (time_offset === undefined || time_offset === null) {
                                    time_offset = '0'
                                }
                                if (alias === undefined || alias === null) {
                                    alias = ''
                                }
                            }
                            this.setState({
                                currentHost: value,
                                currentAlias: alias,
                                currentTimeOffset: time_offset
                            })
                        }}
                    />
                    <div className='centered'><b>{ch.hostname}</b></div>
                    <div className='flex-row width-100'>
                        <TextField
                            fullWidth
                            size='small'
                            disabled={this.state.currentHost === null}
                            variant='outlined'
                            label='Alias'
                            value={this.state.currentAlias}
                            onChange={(ev) => {
                                this.setState({ currentAlias: ev.target.value })
                            }}
                        />
                        <IconButton size='small' disabled={this.state.currentHost === null || this.state.currentAlias === ch.alias}
                            onClick={() => {
                                this.setState({ waiting: true })
                                fetch(develServer + 'api/setAlias.php?id=' + this.state.currentHost.id + '&alias=' + this.state.currentAlias).then(
                                    () => {
                                        this.props.onReload()
                                        this.props.onClose()
                                    }
                                )
                            }}
                        >
                            <CheckIcon />
                        </IconButton>
                    </div>
                    <div className='flex-row width-100'>
                        <NumberInput
                            fullWidth
                            size='small'
                            disabled={this.state.currentHost === null}
                            variant='outlined'
                            label='Time offset'
                            min={-14}
                            max={14}
                            value={parseInt(this.state.currentTimeOffset)}
                            onChange={(val) => {
                                this.setState({ currentTimeOffset: val })
                            }}
                        />
                        <IconButton size='small' disabled={this.state.currentHost === null || this.state.currentTimeOffset === parseInt(ch.time_offset)}
                            onClick={() => {
                                this.setState({ waiting: true })
                                fetch(develServer + 'api/setTimeOffset.php?id=' + this.state.currentHost.id + '&offset=' + this.state.currentTimeOffset).then(
                                    () => {
                                        this.props.onReload()
                                        this.props.onClose()
                                    }
                                )
                            }}
                        >
                            <CheckIcon />
                        </IconButton>
                    </div>
                </Paper>
            </Dialog>
        )
    }
}

class MainMenu extends React.Component {
    constructor(props) {
        super(props)
        let from = new Date()
        let to = new Date()
        from.setSeconds(0)
        from.setMinutes(0)
        from.setHours(0)
        to.setSeconds(59)
        to.setMinutes(59)
        to.setHours(23)
        this.state = {
            autoRefresh: false,
            waiting: false,
            from: from,
            to: to,
            hosts: [],
            units: [],
            identifiers: [],
            currentHost: [],
            currentUnit: [],
            currentIdentifier: [],
            currentLimit: { name: "1024", value: 1024 },
            filterVisible: false,
            settingsVisible: false,
        }
        this.fetchList = this.fetchList.bind(this)
        this.reloadData = this.reloadData.bind(this)
        this.timerReload = this.timerReload.bind(this)
        this.dataReceived = this.dataReceived.bind(this)
    }

    componentDidMount() {
        this.fetchList('hosts')
        this.fetchList('units')
        this.fetchList('identifiers')
        this.reloadData()
        window.addEventListener("resize", this.reloadData)
    }

    componentWillUnmount(){
        window.removeEventListener("resize", this.reloadData)
    }

    fetchList(name) {
        fetch(develServer + 'api/' + name + '.php').then(
            (response) => {
                response.json().then(
                    (json) => {
                        let set = {}
                        set[name] = json
                        this.setState(set)
                    }
                )
            }
        )
    }

    timerReload() {
        if (this.state.autoRefresh) {
            this.reloadData()
        }
    }

    reloadData() {
        let params = {}
        params.hosts = []
        for (let i in this.state.currentHost) {
            params.hosts.push(this.state.currentHost[i].id)
        }
        params.units = []
        for (let i in this.state.currentUnit) {
            params.units.push(this.state.currentUnit[i].id)
        }
        params.identifier = []
        for (let i in this.state.currentIdentifier) {
            params.identifier.push(this.state.currentIdentifier[i].id)
        }
        params.from = this.state.from
        params.to = this.state.to
        params.limit = this.state.currentLimit.value
        params.filter = this.state.loadFilter
        if (this.state.autoRefresh) {
            params.lastId = this.props.lastId
        } else {
            this.props.clearData()
            this.setState({ waiting: true })
        }
        if (this.state.needReload) {
            this.setState({ needReload: false })
        }
        fetch(develServer + 'api/data.php?filter=' + JSON.stringify(params)).then(this.dataReceived)
    }

    async dataReceived(response) {
        let json = await response.json()
        if (this.state.waiting) {
            this.setState({ waiting: false })
        }
        if (this.state.autoRefresh) {
            setTimeout(this.timerReload, 1000)
        }
        if (json === undefined || json === null) {
            return
        }
        this.props.dataReceived(json, this.state.autoRefresh, this.state.currentLimit.value)
    }


    render() {
        let red = ''
        if (this.state.needReload) {
            red = ' red'
        }
        let hostDiv = <Autocomplete
            key='host'
            multiple
            size='small'
            options={this.state.hosts}
            disabled={this.state.autoRefresh}
            getOptionLabel={option => option.displayname}
            value={this.state.currentHost}
            sx={{ minWidth: '8rem' }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label='Host'
                    InputProps={{
                        ...params.InputProps,
                    }}
                />
            )}
            onChange={(event, value) => this.setState({ currentHost: value, needReload: true })}
        />
        let unitDiv = <Autocomplete
            key='unit'
            multiple
            size='small'
            disabled={this.state.autoRefresh}
            options={this.state.units}
            getOptionLabel={option => option.unit}
            value={this.state.currentUnit}
            sx={{ minWidth: '8rem' }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label='Unit'
                    InputProps={{
                        ...params.InputProps,
                    }}
                />
            )}
            onChange={(event, value) => this.setState({ currentUnit: value, needReload: true })}
        />
        let identDiv = <Autocomplete
            key='ident'
            multiple
            size='small'
            disabled={this.state.autoRefresh}
            options={this.state.identifiers}
            getOptionLabel={option => option.identifier}
            value={this.state.currentIdentifier}
            sx={{ minWidth: '8rem' }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label='Identifiers'
                    InputProps={{
                        ...params.InputProps,
                    }}
                />
            )}
            onChange={(event, value) => this.setState({ currentIdentifier: value, needReload: true })}
        />
        let limitDiv = <Autocomplete
            key='limit'
            size='small'
            disabled={this.state.autoRefresh}
            options={limitOptions}
            getOptionLabel={option => option.name}
            isOptionEqualToValue={(option, value) => (option.value === value.value)}
            value={this.state.currentLimit}
            sx={{ minWidth: '8rem' }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label='Limit'
                    InputProps={{
                        ...params.InputProps,
                    }}
                />
            )}
            onChange={(event, value) => this.setState({ currentLimit: value, needReload: true })}
        />

        let settingsDiv
        if (this.state.settingsVisible) {
            settingsDiv = <SettingsDialog onClose={() => this.setState({ settingsVisible: false })} onReload={() => this.componentDidMount()} hosts={this.state.hosts} />
        }

        if (this.props.compact) {
            let filter
            if (this.state.filterVisible) {
                filter = <React.Fragment>
                    {limitDiv}
                    {settingsDiv}
                    {hostDiv}
                    {unitDiv}
                    {identDiv}
                </React.Fragment>
            }
            return (
                <div className={'menu-compact ' + red}>
                    <div className='flex-row flex-gap-025rem'>
                        <Checkbox title='tail -f' checked={this.state.autoRefresh} onClick={() => {
                            let ar = !this.state.autoRefresh
                            this.setState({ autoRefresh: ar })
                            if (ar) {
                                this.setState({ currentPage: 0 })
                                this.props.clearData()
                                setTimeout(this.timerReload, 50)
                            }
                        }} />
                        <DateTimeInput disabled={this.state.autoRefresh} variant='outlined' value={this.state.from} onAccept={(v) => this.setState({ from: v, needReload: true })} />
                        <DateTimeInput disabled={this.state.autoRefresh} variant='outlined' value={this.state.to} onAccept={(v) => this.setState({ to: v, needReload: true })} />
                        <div className='spacer'/>
                        <IconButton size='small' onClick={() => this.setState({ settingsVisible: true })}>
                            <SettingsIcon />
                        </IconButton>
                        <IconButton
                            title='reload'
                            size='small'
                            disabled={this.state.autoRefresh}
                            onClick={this.reloadData}
                        >
                            {this.state.waiting ? <img src='waiting.svg' alt='waiting' style={{ width: '1.5rem' }} /> : <ReplayIcon />}
                        </IconButton>
                        <IconButton size='small' onClick={() => this.setState({ filterVisible: !this.state.filterVisible })}>
                            {this.state.filterVisible ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                        </IconButton>
                        <div style={{width: '0.5rem'}} />
                    </div>
                    {filter}
                    {this.props.pager ?
                        <div className='flex-row'>
                            <div className='spacer' />
                            {this.props.pager}
                            <div className='spacer' />
                        </div>
                        : ''
                    }
                </div>
            )
        } else {
            return (
                <div className={'menu ' + red}>
                    <Checkbox title='tail -f' checked={this.state.autoRefresh} onClick={() => {
                        let ar = !this.state.autoRefresh
                        this.setState({ autoRefresh: ar })
                        if (ar) {
                            this.setState({ currentPage: 0 })
                            this.props.clearData()
                            setTimeout(this.timerReload, 50)
                        }
                    }} />
                    <DateTimeInput disabled={this.state.autoRefresh} variant='outlined' value={this.state.from} onAccept={(v) => this.setState({ from: v, needReload: true })} />
                    <DateTimeInput disabled={this.state.autoRefresh} variant='outlined' value={this.state.to} onAccept={(v) => this.setState({ to: v, needReload: true })} />
                    {settingsDiv}
                    {hostDiv}
                    {unitDiv}
                    {identDiv}
                    {limitDiv}
                    <div className='spacer' />
                    <IconButton size='small' onClick={() => this.setState({ settingsVisible: true })}>
                        <SettingsIcon />
                    </IconButton>
                    {this.props.pager}
                    <IconButton
                        title='reload'
                        size='small'
                        disabled={this.state.autoRefresh}
                        onClick={this.reloadData}
                    >
                        {this.state.waiting ? <img src='waiting.svg' alt='waiting' style={{ width: '1.5rem' }} /> : <ReplayIcon />}
                    </IconButton>
                </div>
            )
        }
    }
}

export default class App extends React.Component {
    constructor(props) {
        super(props)
        this.tableRef = React.createRef()
        this.scolltoEndNeeded = false
        this.data = []
        this.lastId = ''
        this.state = {
            loadFilter: '',
            filter: '',
            needReload: false,
            currentPage: 0,
            detail: undefined,
        }

        this.reload = this.reload.bind(this)
        this.clearData = this.clearData.bind(this)
        this.dataReceived = this.dataReceived.bind(this)
        this.scrollToEnd = this.scrollToEnd.bind(this)
        this.detailClicked = this.detailClicked.bind(this)
    }

    componentDidMount() {
        window.addEventListener('resize', this.reload)
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.reload)
    }

    reload() {
        this.forceUpdate()
    }

    clearData() {
        this.data = []
        this.lastId = ''
        this.reload()
    }

    dataReceived(json, autoRefresh, currentLimit) {
        let lastId = ''
        for (let i in json) {
            let d = json[i]
            let text = ''
            if (lastId < d.id) {
                lastId = d.id
            }
            for (let p in d) {
                if (p === 'id') {
                    continue
                }
                let val = d[p]
                if (p === 'time') {
                    val = formatDateTime(val)
                }
                text += ' ' + val
                d[p] = val
            }
            d.text = text.toLocaleLowerCase()
            json[i] = d
        }
        if (autoRefresh && this.data.length > 0) {
            if (json.length > 0) {
                json.push(...this.data)
                if (json.length > currentLimit) {
                    json.splice(currentLimit, json.length - currentLimit)
                }
                this.data = json
                this.scolltoEndNeeded = true
            }
        } else {
            this.scolltoEndNeeded = true
            this.data = json
        }
        if (!autoRefresh || json.length > 0) {
            this.lastId = lastId
            this.reload()
        }
    }

    scrollToEnd() {
        if (this.tableRef.current && this.scolltoEndNeeded) {
            this.tableRef.current.scrollTo(0, this.tableRef.current.scrollHeight)
        }
        this.scolltoEndNeeded = false
    }

    detailClicked(ev) {
        fetch(develServer + 'api/detail.php?id=' + ev.target.id).then(
            (response) => {
                response.json().then(
                    (json) => {
                        json.fields = JSON.parse(json.fields)
                        this.setState({ detail: json })
                    }
                )
            }
        )
    }

    render() {
        let content = []
        let pageStart = this.state.currentPage * pageSize
        let pageEnd = (this.state.currentPage + 1) * pageSize
        let count = 0
        let i = 0
        let filterList = []
        let regexList = []
        let compact = window.isMobile
        if (this.state.filter.length > 0) {
            let tmpList = this.state.filter.toLocaleLowerCase().split(' ')
            for (let i in tmpList) {
                let s = tmpList[i]
                if (s.toLocaleLowerCase().startsWith('/') && (s.endsWith('/') && s.length > 2)) {
                    s = s.slice(1, s.length)
                    s = s.slice(0, s.length - 1)
                    regexList.push(new RegExp(s))
                } else {
                    filterList.push(s)
                }
            }
        }
        while (i < this.data.length) {
            let d = this.data[i]
            let row = []
            let messageRow
            let trClassName = 'wrap-all'
            if ((count % 2) === 0) {
                trClassName += ' tr-even'
            }
            for (let p in d) {
                let className
                if (p === 'id' || p === 'text') {
                    continue
                }
                let val = d[p]
                if (p === 'time') {
                    className = 'td-nowrap yellow'
                    val = <div id={d['id']} onClick={this.detailClicked} style={{ cursor: 'pointer' }}>{val}</div>
                }
                if (p === 'host') {
                    className = 'td-nowrap green'
                }
                if (p === 'unit') {
                    className = 'td-nowrap salmon'
                }
                if (p === 'identifier') {
                    className = 'td-nowrap blue'
                }
                if (p === 'message') {
                    //val = val.replace(' ','&nbsp;').replace("\n","")
                    if (window.isMobile || compact) {
                        messageRow = <tr key={d.id + p}><td colSpan='4' className={trClassName}>{val}</td></tr>
                    } else {
                        row.push(<td key={p} className={trClassName}>{val}</td>)
                    }
                } else {
                    row.push(<td className={className} key={p}>{val}</td>)
                }
            }
            i++
            if (filterList.length > 0 || regexList.length > 0) {
                let filterFound = true
                let text = d.text
                for (let f in filterList) {
                    f = filterList[f]
                    if (f.startsWith('-')) {
                        f = f.slice(1, f.length)
                        if (text.includes(f)) {
                            filterFound = false
                            break
                        }
                    } else {
                        if (!text.includes(f)) {
                            filterFound = false
                            break
                        }
                    }
                }
                for (let i in regexList) {
                    let r = regexList[i]
                    if (!r.test(text)) {
                        filterFound = false
                    }
                }
                if (!filterFound) {
                    continue//skip
                }
            }
            count++
            if ((count >= pageStart && count < pageEnd)) {
                if (messageRow !== undefined) {
                    content.unshift(messageRow)
                    if (window.innerWidth > window.innerHeight) {
                        content.unshift(<tr key={d.id + '.r1'} className={trClassName + ' italic'}>{row}</tr>)
                    } else {
                        content.unshift(<tr key={d.id + '.r1'} className={trClassName + ' italic'}>{row[2]}{row[3]}</tr>)
                        content.unshift(<tr key={d.id + '.r2'} className={trClassName + ' italic'}>{row[0]}{row[1]}</tr>)
                    }
                } else {
                    content.unshift(<tr key={d.id} className={trClassName}>{row}</tr>)
                }

            }
        }
        let pages = count / pageSize
        if (Math.trunc(pages) !== pages) {
            pages = Math.trunc(pages) + 1
        }
        let pager
        if (pages > 1) {
            pager = <React.Fragment>
                <IconButton title='Posunout na začátek' size='small' onClick={() => this.setState({ currentPage: 0 })} disabled={this.state.currentPage === 0 || this.state.autoRefresh}>
                    <KeyboardDoubleArrowLeftIcon />
                </IconButton>
                <IconButton title='Předchozí stránka' size='small' onClick={() => this.setState({ currentPage: this.state.currentPage - 1 })} disabled={this.state.currentPage === 0 || this.state.autoRefresh}>
                    <KeyboardArrowLeftIcon />
                </IconButton>
                <div className='centered-vertical nowrap'> [ {this.state.currentPage + 1} / {pages} ]</div>
                <IconButton title='Další stránka' size='small' onClick={() => this.setState({ currentPage: this.state.currentPage + 1 })} disabled={this.state.currentPage >= (pages - 1) || this.state.autoRefresh}>
                    <KeyboardArrowRightIcon />
                </IconButton>
                <IconButton title='Posunout na konec' size='small' onClick={() => this.setState({ currentPage: (pages - 1) })} disabled={this.state.currentPage >= (pages - 1) || this.state.autoRefresh}>
                    <KeyboardDoubleArrowRightIcon />
                </IconButton>
            </React.Fragment>
        }
        setTimeout(this.scrollToEnd, 25)
        document.title = 'Web Log View ... ' + this.data.length + '/' + count

        let detail
        if (this.state.detail !== undefined) {
            let fields = []
            fields.push(<tr key='time'><td>Time: </td><td style={{ overflowWrap: 'anywhere', minWidth: '60vw' }}>{this.state.detail.time}</td></tr>)
            for (let i in this.state.detail.fields) {
                let f = this.state.detail.fields[i]
                fields.push(<tr key={i}><td>{i}: </td><td style={{ overflowWrap: 'anywhere', minWidth: '60vw' }}>{f}</td></tr>)
            }
            fields.push(<tr key='message'><td colSpan={2} style={{ overflowWrap: 'anywhere', minWidth: '60vw' }}>{this.state.detail.message}</td></tr>)
            detail = <Dialog open={true} maxWidth='xl' onClose={() => this.setState({ detail: undefined })}>
                <Paper sx={{ padding: '0.5rem', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ marginLeft: 'auto', marginRight: 'auto' }}><b>{this.state.detail.time}</b></div>
                    <pre style={{ whiteSpace: 'break-spaces' }}>
                        <table>
                            <tbody>
                                {fields}
                            </tbody>
                        </table>
                    </pre>
                </Paper>
            </Dialog>
        }

        return (
            <React.Fragment>
                <CssBaseline key="css" />
                <ThemeProvider theme={theme}>
                    <LocalizationProvider dateAdapter={AdapterDayjs} locale='cs'>
                        <Paper className='main-horizontal' square>
                            <MainMenu clearData={this.clearData} dataReceived={this.dataReceived} pager={pager} lastId={this.lastId} compact={compact} />
                            <div className='content' ref={this.tableRef}>
                                <table>
                                    <tbody>
                                        {content}
                                    </tbody>
                                </table>
                            </div>
                            <div className='hline'/>
                            <div className='flex-row width-100'>
                                <DelayedSearchInput
                                    fullWidth
                                    size='small'
                                    variant='filled'
                                    label='Filter'
                                    placeholder='STRING or -STRING or /RegExp/'
                                    value={this.state.filter}
                                    fired={(v) => {
                                        this.setState({ filter: v })
                                        this.scolltoEndNeeded = true
                                    }}
                                />
                            </div>
                            {detail}
                        </Paper>
                    </LocalizationProvider>
                </ThemeProvider>
            </React.Fragment>
        )
    }
}

