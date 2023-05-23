import React from 'react'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'

class NumberInput extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            value: props.value ? props.value : 0,
            min: props.min ? props.min : 0,
            max: props.max ? props.max : 100,
            label: props.label ? props.label : 'Number'
        }
        if (this.state.value < this.state.min) {
            this.state.value = this.state.min
        }
        this.state.lastValue = this.state.value
        this.changed = this.changed.bind(this)
        this.inc = this.inc.bind(this)
        this.dec = this.dec.bind(this)
    }

    componentDidUpdate(prevProps) {
        if (prevProps.value !== this.props.value) {
            this.setState({
                value: this.props.value,
            })
        }
    }

    inc() {
        if (this.state.value < this.state.max) {
            this.setState({ value: this.state.value + 1, lastValue: this.state.value })
            if (this.props.onChange) {
                this.props.onChange(this.state.value + 1)
            }
        }
    }

    dec() {
        if (this.state.value > this.state.min) {
            this.setState({ value: this.state.value - 1, lastValue: this.state.value })
            if (this.props.onChange) {
                this.props.onChange(this.state.value - 1)
            }
        }
    }

    changed(ev) {
        if (ev.target.value === '') {
            this.setState({ value: '' })
        } else if (isNaN(ev.target.value)) {
            this.setState({ value: this.state.lastValue })
        } else {
            let val = Number(ev.target.value)
            if (val > this.state.max) {
                val = this.state.max
            }
            if (val < this.state.min) {
                val = this.state.min
            }
            this.setState({ value: val, lastValue: this.state.value })
            if (this.props.onChange) {
                this.props.onChange(val)
            }
        }
    }

    render() {
        let error = this.state.value === undefined || isNaN(this.state.value)
        return (
            <TextField
                error={error}
                sx={{ marginTop: 'auto', marginBottom: 'auto' }}
                size='small'
                label={this.state.label}
                value={this.state.value}
                onChange={this.changed}
                disabled={this.props.disabled}
                fullWidth={this.props.fullWidth}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <IconButton size="small" onClick={this.inc} disabled={this.props.disabled}>
                                <AddIcon />
                            </IconButton>
                        </InputAdornment>
                    ),
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton size="small" onClick={this.dec} disabled={this.props.disabled}>
                                <RemoveIcon />
                            </IconButton>
                        </InputAdornment>
                    ),
                    inputProps: {
                        style: { textAlign: "center" },
                    }
                }}
            />
        )
    }
}

export default NumberInput
