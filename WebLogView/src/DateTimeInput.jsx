import React from 'react'
import { MobileDateTimePicker } from '@mui/x-date-pickers/MobileDateTimePicker';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import TextField from '@mui/material/TextField';

export default class DateTimeInput extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            value: new Date(),
            variant: 'standard',
            dateOnly: false,
        }
    }

    componentDidMount() {
        if (this.props.value) {
            this.setState({ value: this.props.value })
        }
        if (this.props.dateOnly) {
            this.setState({ dateOnly: this.props.dateOnly })
        }
        if (this.props.variant) {
            this.setState({ variant: this.props.variant })
        }
    }

    componentDidUpdate(prevProps) {
        if (JSON.stringify(prevProps) !== JSON.stringify(this.props)) {
            this.componentDidMount()
        }
    }

    render() {
        if (this.state.dateOnly) {
            return (
                <MobileDatePicker
                    label={this.props.label}
                    disabled={this.props.disabled}
                    inputFormat="D.M.YYYY"
                    value={this.state.value}
                    onChange={(p) => {
                        this.setState({ value: p.toDate() })
                    }}
                    onAccept={() => {
                        if (this.props.onAccept) {
                            this.props.onAccept(this.state.value)
                        }
                    }}
                    renderInput={(params) => <TextField variant={this.state.variant} size="small" {...params} sx={{ minWidth: '8rem', input: { textAlign: 'center' } }} />}
                />
            )
        } else {
            let inputFormat = "D.M.YYYY HH:mm"
            if(this.props.secondsEnabled){
                inputFormat = "D.M.YYYY HH:mm:ss"
            }
            return (
                <MobileDateTimePicker
                    label={this.props.label}
                    disabled={this.props.disabled}
                    inputFormat={inputFormat}
                    value={this.state.value}
                    onChange={(p) => {
                        this.setState({ value: p.toDate() })
                    }}
                    onAccept={() => {
                        if (this.props.onAccept) {
                            this.props.onAccept(this.state.value)
                        }
                    }}
                    renderInput={(params) => <TextField variant={this.state.variant} size="small" {...params} sx={{ minWidth: '8rem', input: { textAlign: 'center' } }} />}
                />
            )
        }

    }
}