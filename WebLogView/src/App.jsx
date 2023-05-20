import React from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import CssBaseline from '@mui/material/CssBaseline'
import 'dayjs/locale/cs'

import { Paper, TextField, Autocomplete, IconButton, Checkbox } from '@mui/material'
import ReplayIcon from '@mui/icons-material/Replay'
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft'
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight'

import DateTimeInput from './DateTimeInput'
import DelayedSearchInput from './DelayedSearchInput'

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

export function isMobile() {
    var check = false;
    (function (a) {
        if (
            /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
                a
            ) ||
            /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
                a.substr(0, 4)
            )
        )
            check = true
    })(navigator.userAgent || navigator.vendor || window.opera)
    return check
}

export default class App extends React.Component {
    constructor(props) {
        super(props)
        this.tableRef = React.createRef()
        this.scolltoEndNeeded = false
        let from = new Date()
        let to = new Date()
        from.setSeconds(0)
        from.setMinutes(0)
        from.setHours(0)
        to.setSeconds(59)
        to.setMinutes(59)
        to.setHours(23)
        this.state = {
            hosts: [],
            units: [],
            identifiers: [],
            currentHost: [],
            currentUnit: [],
            currentIdentifier: [],
            currentLimit: { name: "1024", value: 1024 },
            loadFilter: '',
            from: from,
            to: to,
            autoRefresh: false,
            filter: '',
            data: [],
            needReload: false,
            currentPage: 0,
            waiting: false,
        }
        this.fetchList = this.fetchList.bind(this)
        this.reload = this.reload.bind(this)
        this.reloadData = this.reloadData.bind(this)
        this.scrollToEnd = this.scrollToEnd.bind(this)
        this.timerReload = this.timerReload.bind(this)
    }

    componentDidMount() {
        this.fetchList('hosts')
        this.fetchList('units')
        this.fetchList('identifiers')
        window.addEventListener('resize', this.reload)
        this.reloadData()
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.reload)
    }

    reload() {
        this.forceUpdate()
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
        if (this.state.autoRefresh && this.state.data.length > 0) {
            params.lastId = this.state.data[0].id
        } else {
            this.setState({ data: [] })
        }
        this.setState({ needReload: false })
        this.setState({ waiting: true })
        fetch('api/data.php?filter=' + JSON.stringify(params)).then(
            (response) => {
                this.setState({ waiting: false })
                if (this.state.autoRefresh) {
                    setTimeout(this.timerReload, 2000)
                }
                response.json().then(
                    (json) => {
                        if (this.state.autoRefresh && this.state.data.length > 0) {
                            if (json.length) {
                                json.push(...this.state.data)
                                if (json.length > (this.state.currentLimit.value * 2)) {
                                    json.splice(0, json.length - this.state.currentLimit.value)
                                }
                                this.setState({ data: json })
                                this.scolltoEndNeeded = true
                            }
                        } else {
                            this.scolltoEndNeeded = true
                            this.setState({ data: json })
                        }
                    }
                )
            }
        )
    }

    fetchList(name) {
        fetch('api/' + name + '.php').then(
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

    scrollToEnd() {
        if (this.tableRef.current && this.scolltoEndNeeded) {
            this.tableRef.current.scrollTo(0, this.tableRef.current.scrollHeight)
        }
        this.scolltoEndNeeded = false
    }

    render() {
        let content = []
        let header = []
        let pageStart = this.state.currentPage * pageSize
        let pageEnd = (this.state.currentPage + 1) * pageSize
        let count = 0
        let i = 0
        while (i < this.state.data.length) {
            let d = this.state.data[i]
            let row = []
            let insertHeader = header.length === 0
            let text = ''
            for (let p in d) {
                if (p === 'id') {
                    continue
                }
                if (insertHeader) {
                    header.push(<th key={p}>{p}</th>)
                }
                let val = d[p]
                if (p === 'time') {
                    val = formatDateTime(val)
                }
                if (p === 'message') {
                    row.push(<td key={p} className='message'>{val}</td>)
                } else {
                    row.push(<td key={p}>{val}</td>)
                }
                text += ' ' + val
            }
            if (insertHeader) {
                header = <tr key='head'>{header}</tr>
            }
            i++
            if (this.state.filter.length > 0) {
                let filterList = this.state.filter.toLocaleLowerCase().split(' ')
                let filterFound = true
                text = text.toLocaleLowerCase()
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
                if (!filterFound) {
                    continue//skip
                }
            }
            count++
            if ((count >= pageStart && count < pageEnd)) {
                content.unshift(<tr key={d.id}>{row}</tr>)
            }
        }
        let pages = count / pageSize
        if (Math.trunc(pages) !== pages) {
            pages = Math.trunc(pages) + 1
        }
        let orientation = 'vertical'
        let afterFilterHorizontal
        let afterFilterVertical
        if (window.innerWidth < window.innerHeight) {
            orientation = 'horizontal'
            afterFilterHorizontal = <div className='flex-row gray'>
                <DelayedSearchInput
                    fullWidth
                    size='small'
                    variant='filled'
                    label='Filter'
                    value={this.state.filter}
                    fired={(v) => {
                        this.setState({ filter: v })
                        this.scolltoEndNeeded = true
                    }}
                />
                <div className='count'>
                    <IconButton title='Posunout na začátek' size='small' onClick={() => this.setState({ currentPage: 0 })} disabled={this.state.currentPage === 0 || this.state.autoRefresh}>
                        <KeyboardDoubleArrowLeftIcon />
                    </IconButton>
                    <IconButton title='Předchozí stránka' size='small' onClick={() => this.setState({ currentPage: this.state.currentPage - 1 })} disabled={this.state.currentPage === 0 || this.state.autoRefresh}>
                        <KeyboardArrowLeftIcon />
                    </IconButton>
                    <div className='centered nowrap'> [ {this.state.currentPage + 1} / {pages} ]</div>
                    <IconButton title='Další stránka' size='small' onClick={() => this.setState({ currentPage: this.state.currentPage + 1 })} disabled={this.state.currentPage >= (pages - 1) || this.state.autoRefresh}>
                        <KeyboardArrowRightIcon />
                    </IconButton>
                    <IconButton title='Posunout na konec' size='small' onClick={() => this.setState({ currentPage: (pages - 1) })} disabled={this.state.currentPage >= (pages - 1) || this.state.autoRefresh}>
                        <KeyboardDoubleArrowRightIcon />
                    </IconButton>
                </div>
            </div>
        } else {
            afterFilterVertical = <div className='flex-column gray' style={{ marginTop: 'auto' }}>
                <DelayedSearchInput
                    fullWidth
                    size='small'
                    variant='filled'
                    label='Filter'
                    value={this.state.filter}
                    fired={(v) => {
                        this.setState({ filter: v })
                        this.scolltoEndNeeded = true
                    }}
                />
                <div className='count'>
                    <IconButton title='Posunout na začátek' size='small' onClick={() => this.setState({ currentPage: 0 })} disabled={this.state.currentPage === 0 || this.state.autoRefresh}>
                        <KeyboardDoubleArrowLeftIcon />
                    </IconButton>
                    <IconButton title='Předchozí stránka' size='small' onClick={() => this.setState({ currentPage: this.state.currentPage - 1 })} disabled={this.state.currentPage === 0 || this.state.autoRefresh}>
                        <KeyboardArrowLeftIcon />
                    </IconButton>
                    <div className='centered nowrap'> [ {this.state.currentPage + 1} / {pages} ]</div>
                    <IconButton title='Další stránka' size='small' onClick={() => this.setState({ currentPage: this.state.currentPage + 1 })} disabled={this.state.currentPage >= (pages - 1) || this.state.autoRefresh}>
                        <KeyboardArrowRightIcon />
                    </IconButton>
                    <IconButton title='Posunout na konec' size='small' onClick={() => this.setState({ currentPage: (pages - 1) })} disabled={this.state.currentPage >= (pages - 1) || this.state.autoRefresh}>
                        <KeyboardDoubleArrowRightIcon />
                    </IconButton>
                </div>
            </div>
        }
        let red = ''
        if (this.state.needReload) {
            red = ' red'
        }
        setTimeout(this.scrollToEnd, 50)
        return (
            <React.Fragment>
                <CssBaseline key="css" />
                <ThemeProvider theme={theme}>
                    <LocalizationProvider dateAdapter={AdapterDayjs} locale='cs'>
                        <Paper className={'main-' + orientation} square>
                            <div className={'menu-' + orientation + red}>
                                <div className='flex-row'>
                                    <Checkbox title='tail -f' checked={this.state.autoRefresh} onClick={() => {
                                        let ar = !this.state.autoRefresh
                                        this.setState({ autoRefresh: ar })
                                        if (ar) {
                                            this.setState({ data: [], currentPage: 0 })
                                            setTimeout(this.timerReload, 50)
                                        }
                                    }} />
                                    {orientation === 'vertical' ? <div className='flex-grow' /> : ''}
                                    <div className='centered nowrap'>{this.state.data.length} / {count}</div>
                                    {orientation === 'vertical' ? <div className='flex-grow' /> : ''}
                                    <IconButton
                                        title='reload'
                                        size='small'
                                        disabled={this.state.autoRefresh}
                                        onClick={this.reloadData}
                                    >
                                        {this.state.waiting ? <img src='waiting.svg' alt='waiting' style={{ width: '1.5rem' }} /> : <ReplayIcon />}
                                    </IconButton>
                                </div>
                                <DateTimeInput disabled={this.state.autoRefresh} variant='outlined' value={this.state.from} onAccept={(v) => this.setState({ from: v, needReload: true })} />
                                <DateTimeInput disabled={this.state.autoRefresh} variant='outlined' value={this.state.to} onAccept={(v) => this.setState({ to: v, needReload: true })} />
                                <Autocomplete
                                    fullWidth
                                    multiple
                                    size='small'
                                    options={this.state.hosts}
                                    disabled={this.state.autoRefresh}
                                    getOptionLabel={option => option.hostname}
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
                                    onChange={(event, value) => this.setState({ currentHost: value, needReload: true })}
                                />
                                <Autocomplete
                                    fullWidth
                                    multiple
                                    size='small'
                                    disabled={this.state.autoRefresh}
                                    options={this.state.units}
                                    getOptionLabel={option => option.unit}
                                    value={this.state.currentUnit}
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
                                <Autocomplete
                                    fullWidth
                                    multiple
                                    size='small'
                                    disabled={this.state.autoRefresh}
                                    options={this.state.identifiers}
                                    getOptionLabel={option => option.identifier}
                                    value={this.state.currentIdentifier}
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
                                <Autocomplete
                                    fullWidth
                                    size='small'
                                    disabled={this.state.autoRefresh}
                                    options={limitOptions}
                                    getOptionLabel={option => option.name}
                                    isOptionEqualToValue={(option, value) => (option.value === value.value)}
                                    value={this.state.currentLimit}
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
                                <TextField
                                    fullWidth
                                    size='small'
                                    disabled={this.state.autoRefresh}
                                    variant='outlined'
                                    label='Filter'
                                    value={this.state.loadFilter}
                                    onChange={(ev) => {
                                        this.setState({ loadFilter: ev.target.value, needReload: true })
                                    }}
                                />
                                {afterFilterVertical}
                            </div>
                            <div className={'divider-' + orientation} />
                            <div className='content' ref={this.tableRef}>
                                <table>
                                    <thead>
                                        {header}
                                    </thead>
                                    <tbody>
                                        {content}
                                    </tbody>
                                </table>
                            </div>
                            {afterFilterHorizontal}
                        </Paper>
                    </LocalizationProvider>
                </ThemeProvider>
            </React.Fragment>
        )
    }
}

