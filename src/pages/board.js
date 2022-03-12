import React from 'react';
import * as mui from '@mui/material';
import { Link } from 'react-router-dom';
import BoardData from '../components/boardData';
import routerNavigate from '../components/routerNavigate';
import './board.css';
import { getDatabase, ref, onValue, set } from 'firebase/database';
import QRCode from "react-qr-code";
import { Buffer } from 'buffer';
import { v4 as uuidv4 } from 'uuid';
import Hotkeys from 'react-hot-keys';
import Helmet from 'react-helmet';

class BoardPage extends React.Component {
    constructor(props) {
        super(props);
        this.db = getDatabase();
        this.state = {
            new: false,
            id: '',
            name: '',
            data: [],
            online: false,
            loading: true,
            error: '',
            qrSrc: '',
            shareOpen: false,
            notification: '',
            lastData: [],
        };
        this.qrRef = React.createRef();
    }

    componentDidMount() {
        this.reloadBoard();
        this.idInterval = setInterval(_ => this.reloadBoard(), 1000);
    }

    componentWillUnmount() {
        if (this.idInterval)
            clearInterval(this.idInterval);
    }

    addAsShared() {
        const sharedBoards = JSON.parse(localStorage.getItem('sharedBoards')).filter(p => p !== this.state.id);
        sharedBoards.push(this.state.id);
        localStorage.setItem('sharedBoards', JSON.stringify(sharedBoards));
    }

    reloadBoard() {
        const id = new URLSearchParams(window.location.search).get('id');
        if (id !== null && id !== this.state.id) {
            this.setState({
                new: id === null,
                id: id || '',
                name: '',
                data: [],
                online: false,
                loading: id !== null,
                error: '',
            }, _ => {
                if (!this.state.new) {
                    const localData = localStorage.getItem(this.state.id);
                    if (localData === null) {
                        onValue(ref(this.db, `${this.state.id}`), v => {
                            if (v.val() === null) {
                                this.setState({
                                    loading: false,
                                    error: 'Das Board existiert nicht :(',
                                });
                            }
                            else {
                                this.setState({
                                    name: v.val().name,
                                    data: Object.values(v.val().data || {}),
                                    loading: false,
                                    online: true,
                                }, _ => {
                                    const sharedBoards = JSON.parse(localStorage.getItem('sharedBoards'));
                                    if (sharedBoards.findIndex(p => p === this.state.id) === -1) {
                                        this.addAsShared();
                                    }
                                });
                            }
                        });
                    } else {
                        const parsedData = JSON.parse(localData);
                        this.setState({
                            name: parsedData.name,
                            data: parsedData.data,
                            loading: false,
                            online: false,
                        });
                    }
                }
            });
        }
    }

    share() {
        if (!this.state.online) {
            const localBoards = JSON.parse(localStorage.getItem('localBoards')).filter(p => p !== this.state.id);
            localStorage.setItem('localBoards', JSON.stringify(localBoards));
            if (localStorage.getItem(this.state.id) !== null) {
                localStorage.removeItem(this.state.id);
            }
            set(ref(this.db, this.state.id), { name: this.state.name, data: this.state.data });
        }
        const svgData = new XMLSerializer().serializeToString(this.qrRef.current.children[0]);
        this.setState({
            online: true,
            qrSrc: `data:image/svg+xml;base64,${Buffer.from(svgData, 'ascii').toString('base64')}`,
            shareOpen: true,
        });
        this.addAsShared();
    }

    undo() {
        const history = JSON.parse(JSON.stringify(this.state.lastData));
        const last = history.pop();
        if (last) {
            this.setState({
                lastData: history,
            }, _ => this.onDataChange(last, true));
        }
    }

    onNameChange(e) {
        this.setState({
            name: e.target.value,
        });
    }

    onNameKey(e) {
        if (e.keyCode === 13 && this.state.name.replace(/\W/g, '') !== '') {
            if (this.state.id === '') {
                this.setState({
                    id: uuidv4().replaceAll('-', ''),
                }, _ => {
                    this.onDataChange(this.state.data);
                    this.props.navigate(`/board?id=${this.state.id}`, { replace: true });
                });
            }
            if (this.state.online) {
                set(ref(this.db, `${this.state.id}/name`), this.state.name);
            }
            else {
                this.onDataChange(this.state.data);
            }
            this.setState({
                notification: 'Name gespeichert!',
            });
        }
    }

    onDataChange(data, noHistory) {
        if (this.state.id !== '') {
            if (this.state.online) {
                set(ref(this.db, `${this.state.id}/data`), data);
            }
            else {
                const localBoards = JSON.parse(localStorage.getItem('localBoards'));
                if (localBoards.findIndex(p => p === this.state.id) === -1) {
                    localBoards.push(this.state.id);
                    localStorage.setItem('localBoards', JSON.stringify(localBoards));
                }
                localStorage.setItem(this.state.id, JSON.stringify({ name: this.state.name, data }));
            }
        }
        this.setState({
            data,
            lastData: noHistory ? this.state.lastData : [
                ...this.state.lastData,
                this.state.data,
            ].slice(-10),
        });
    }

    copyLink() {
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(`https://wichtige-notizen.web.app/board?id=${this.state.id}`);
        }
    }

    render() {
        const rootStyle = {
            backgroundColor: '#fff',
            position: 'fixed',
            top: '0',
            left: '0',
            minWidth: '100vw',
            minHeight: '100vh',
        };

        return (
            <>
                <Hotkeys
                    keyName='ctrl+z'
                    allowRepeat
                    onKeyDown={_ => this.undo()}
                />
                <Hotkeys
                    keyName='ctrl+y'
                    onKeyDown={_ => this.share()}
                />
                <div style={rootStyle}>
                    <Helmet>
                        <title>
                            {this.state.name || 'Notizen'}
                        </title>
                    </Helmet>
                    <mui.AppBar position='static'>
                        <mui.Toolbar>
                            <mui.Tooltip title='Alle Boards'>
                                <mui.IconButton style={{ color: 'white', marginRight: '5px' }} size='large' component={Link} to='/'>
                                    <mui.Icon>
                                        arrow_back_rounded
                                    </mui.Icon>
                                </mui.IconButton>
                            </mui.Tooltip>
                            <mui.Typography variant='h2' marginY='10px'>
                                Board
                            </mui.Typography>
                            <mui.Tooltip title={this.state.online ? 'Online' : 'Offline'}>
                                <mui.Icon fontSize='large' color={this.state.online ? '' : 'disabled'}
                                    style={{ color: this.state.online ? '#0c0' : '', marginLeft: '10px' }}>
                                    {this.state.online ? 'circle' : 'offline_bolt'}
                                </mui.Icon>
                            </mui.Tooltip>
                            <mui.Tooltip title='Board teilen'>
                                <span>
                                    <mui.IconButton disabled={this.state.id === ''}
                                        style={{ color: this.state.id === '' ? '' : 'white', marginLeft: '5px' }} size='large' onClick={_ => this.share()}>
                                        <mui.Icon>
                                            share
                                        </mui.Icon>
                                    </mui.IconButton>
                                </span>
                            </mui.Tooltip>
                            <mui.Tooltip title='Rückgängig'>
                                <span>
                                    <mui.IconButton disabled={this.state.lastData.length === 0}
                                        style={{ color: this.state.lastData.length === 0 ? '' : 'white', marginLeft: '5px' }} size='large' onClick={_ => this.undo()}>
                                        <mui.Icon>
                                            undo
                                        </mui.Icon>
                                    </mui.IconButton>
                                </span>
                            </mui.Tooltip>
                        </mui.Toolbar>
                        <mui.TextField fullWidth variant='outlined' label='Name' className='invertedField'
                            value={this.state.name} onChange={e => this.onNameChange(e)} onKeyDown={e => this.onNameKey(e)} />
                    </mui.AppBar>

                    <BoardData name={this.state.name} data={this.state.data} onDataChange={data => this.onDataChange(data)} />

                    <mui.Popover open={this.state.shareOpen} onClose={_ => this.setState({ shareOpen: false })} BackdropProps
                        anchorOrigin={{ horizontal: 'center', vertical: 'top' }}
                        transformOrigin={{ horizontal: 'center', vertical: 'top' }}>
                        <mui.Box padding='20px'>
                            <mui.Typography variant='h4'>
                                Board ist online
                            </mui.Typography>
                            <br />
                            Teile diesen Link (klicken zum kopieren):
                            <mui.Link marginLeft='5px' style={{ cursor: 'pointer' }} onClick={_ => this.copyLink()}>
                                {`https://wichtige-notizen.web.app/board?id=${this.state.id}`}
                            </mui.Link>
                            <br />
                            <img src={this.state.qrSrc} alt='qr' style={{ display: 'block', margin: '20px auto' }} />
                            <mui.Button fullWidth variant='outlined' onClick={_ => this.setState({ shareOpen: false })}
                                startIcon={<mui.Icon>close</mui.Icon>}>
                                Schließen
                            </mui.Button>
                        </mui.Box>
                    </mui.Popover>
                    <div ref={this.qrRef}>
                        <QRCode style={{ display: 'none' }} value={`https://wichtige-notizen.web.app/board?id=${this.state.id}`} />
                    </div>

                    <mui.Popover open={this.state.error !== ''} BackdropProps
                        anchorOrigin={{ horizontal: 'center', vertical: 'top' }}
                        transformOrigin={{ horizontal: 'center', vertical: 'top' }}>
                        <mui.Box padding='40px'>
                            <mui.Typography variant='h4' color='error'>
                                Error
                            </mui.Typography>
                            <br />
                            {this.state.error}
                            <br />
                            <mui.Box marginTop='20px'>
                                <mui.Button variant='outlined' component={Link} to='/'
                                    startIcon={<mui.Icon>arrow_back_rounded</mui.Icon>}>
                                    Zurück
                                </mui.Button>
                            </mui.Box>
                        </mui.Box>
                    </mui.Popover>

                    <mui.Snackbar
                        open={this.state.notification !== ''}
                        autoHideDuration={1000}
                        onClose={_ => this.setState({ notification: '' })}
                        message={this.state.notification} />
                </div>
            </>
        );
    }
}

export default routerNavigate(BoardPage);
