import React from 'react'
import TextField from '@mui/material/TextField'

class DelayedSearchInput extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            filter: this.props.filter === undefined ? "" : this.props.filter,
            name: this.props.name === undefined ? "filtr" : this.props.name,
            timer: undefined
        }
        this.changed = this.changed.bind(this)
        this.timeout = this.timeout.bind(this)
    }

    componentWillUnmount() {
        if (this.state.timer) {
            clearTimeout(this.state.timer)
            this.setState({ timer: undefined })
        }
    }

    changed(ev) {
        this.setState({ filter: ev.target.value })
        if (this.state.timer) {
            clearTimeout(this.state.timer)
        }
        this.setState({ timer: setTimeout(this.timeout, 500) })
    }

    timeout() {
        if (this.state.timer) {
            clearTimeout(this.state.timer)
            this.setState({ timer: undefined })
        }
        this.props.fired(this.state.filter)
    }

    render() {
        return (
                <TextField
                    fullWidth
                    size='small'
                    type="search"
                    variant={this.props.variant}
                    className='width-max'
                    value={this.state.filter}
                    label={this.props.label}
                    onChange={this.changed}
                />
        )
    }
}

export default DelayedSearchInput
