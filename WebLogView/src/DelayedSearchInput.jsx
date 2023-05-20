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
        let style = {
            ...this.props.style,
            position: 'relative'
        }
        let variant
        if (this.props.variant) {
            variant = this.props.variant
        } else {
            variant = 'outlined'
            style.paddingTop = '0.5rem'
            style.height = '3rem'
        }
        return (
            <div className="flex-row width-max margin-bottom-025rem" style={style}>
                <TextField
                    fullWidth
                    size='small'
                    type="search"
                    variant={variant}
                    className='width-max'
                    value={this.state.filter}
                    label={this.props.label}
                    onChange={this.changed}
                />
            </div>
        )
    }
}

export default DelayedSearchInput
