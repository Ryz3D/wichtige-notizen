import React from 'react';
import * as mui from '@mui/material';
import isURL from '../data/isURL';

class BoardEntry extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            text: (this.props.data || {}).t,
            showImg: false,
        };
        this.lastText = this.state.text;
        this.inputRef = React.createRef();
    }

    componentDidMount() {
        if (this.props.edit) {
            this.setCursorEnd();
            this.lastEdit = this.props.edit;
        }
    }

    componentDidUpdate() {
        if (this.lastText !== (this.props.data || {}).t) {
            this.lastText = (this.props.data || {}).t;
            this.setState({
                text: this.lastText,
            });
        }
        if (this.lastEdit !== this.props.edit) {
            this.setCursorEnd();
            this.lastEdit = this.props.edit;
        }
    }

    setCursorEnd() {
        setTimeout(_ => {
            if (this.inputRef.current) {
                const input = this.inputRef.current.getElementsByTagName('div')[0].getElementsByTagName('textarea')[0];
                input.selectionStart = input.selectionEnd = 10000;
            }
        }, 0);
    }

    onKey(e) {
        if (e.keyCode === 13 && e.shiftKey) {
            e.preventDefault();
            this.props.save();
            this.props.onNext();
            return false;
        }
        if (e.keyCode === 27) {
            this.props.onClear();
            return false;
        }
    }

    onChange(e) {
        this.setState({
            text: e.target.value,
        }, _ => this.props.set({
            ...this.props.data,
            t: this.state.text,
        }));
    }

    transformText(text) {
        if (text.replace(' ', '')) {
            return <>{text}</>;
        }
        else {
            return <div style={{ height: '24.5px' }} />;
        }
    }

    render() {
        const inputStyle = {
            width: '100%',
        };
        const boxStyle = this.props.solid ? {
            width: 'unset',
            margin: '1vh auto',
        } : {
            width: '100%',
            margin: '1vh 10px',
        };
        const imgListItemStyle = {
            width: '180px',
            display: this.state.showImg ? 'block' : 'none',
            margin: '5px 0',
            pointerEvents: 'none',
        };
        const textStyle = {
            textAlign: 'left',
            textTransform: 'none',
            hyphens: 'auto',
            wordBreak: 'break-word',
            whiteSpace: 'pre-line',
            pointerEvents: 'none',
        };

        return (
            <mui.ListItem disablePadding style={{ width: '232px' }}>
                <mui.Box style={boxStyle} width='100%' margin='1vh 10px'>
                    {this.props.edit ?
                        <mui.TextField autoFocus multiline style={inputStyle} onKeyDown={e => this.onKey(e)} variant={(this.props.data || {}).h ? 'filled' : 'outlined'}
                            label='Text' onContextMenu={this.props.onContext} value={this.state.text} onChange={e => this.onChange(e)} ref={this.inputRef} />
                        :
                        <mui.Button fullWidth variant={(this.props.data || {}).h ? 'contained' : 'outlined'} className='notRoot'
                            onContextMenu={this.props.onContext} onClick={this.props.onClick} disabled={this.props.disabled}
                            color={this.props.thisMove ? 'success' : (this.props.itemMove ? 'warning' : 'primary')}>
                            <mui.List disablePadding style={{ width: '100%', pointerEvents: 'none' }}>
                                {isURL(this.lastText) &&
                                    <mui.ImageListItem style={imgListItemStyle}>
                                        <img ref={this.imgRef} alt='' src={this.lastText} onLoad={_ => this.setState({ showImg: true })} />
                                    </mui.ImageListItem>
                                }
                                {!this.state.showImg &&
                                    <div style={textStyle}>
                                        {this.props.text || this.transformText(this.lastText)}
                                    </div>
                                }
                            </mui.List>
                        </mui.Button>
                    }
                </mui.Box>
            </mui.ListItem >
        );
    }
}

export default BoardEntry;
