import React from 'react';
import * as mui from '@mui/material';
import './board.css';
import { Link } from 'react-router-dom';
import BoardData from '../components/boardData';
import routerNavigate from '../wrapper/routerNavigate';
import { getDatabase, ref, onValue, set, remove } from 'firebase/database';
import QRCode from "react-qr-code";
import { Buffer } from 'buffer';
import { v4 as uuidv4 } from 'uuid';
import Hotkeys from 'react-hot-keys';
import Helmet from 'react-helmet';
import muiTheme from '../wrapper/muiTheme';
import {
    ArrowBackRounded as ArrowBackRoundedIcon,
    Circle as CircleIcon,
    Close as CloseIcon,
    Delete as DeleteIcon,
    OfflineBolt as OfflineBoltIcon,
    Share as ShareIcon,
    Undo as UndoIcon,
} from '@mui/icons-material';

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
            uploading: 0,
        };
        this.qrRef = React.createRef();
        this.darkTheme = mui.createTheme({
            palette: {
                mode: 'dark',
            },
        });
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
        if (id !== this.state.id) {
            if (id === null) {
                this.setState({
                    new: true,
                    loading: false,
                    online: false,
                });
            }
            else {
                this.setState({
                    new: id === null,
                    id: id,
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
                                    }, _ => this.addAsShared());
                                }
                            });
                        } else {
                            const localBoards = JSON.parse(localStorage.getItem('localBoards')).filter(p => p !== this.state.id);
                            localBoards.push(this.state.id);
                            localStorage.setItem('localBoards', JSON.stringify(localBoards));

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
    }

    share() {
        if (!this.state.online) {
            const localBoards = JSON.parse(localStorage.getItem('localBoards')).filter(p => p !== this.state.id);
            localStorage.setItem('localBoards', JSON.stringify(localBoards));
            if (localStorage.getItem(this.state.id) !== null) {
                localStorage.removeItem(this.state.id);
            }
            this.setState({
                uploading: this.state.uploading + 1,
            });
            set(ref(this.db, this.state.id), { name: this.state.name, data: this.state.data })
                .then(_ => this.setState({
                    uploading: this.state.uploading - 1,
                }));
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

    saveNewBoard(newData) {
        if (this.state.new) {
            this.setState({
                id: uuidv4().replaceAll('-', ''),
                new: false,
            }, _ => {
                this.onDataChange(newData || this.state.data);
                this.props.navigate(`/board?id=${this.state.id}`, { replace: true });
            });
        }
    }

    saveName() {
        this.saveNewBoard();
        if (this.state.online) {
            this.setState({
                uploading: this.state.uploading + 1,
            });
            set(ref(this.db, `${this.state.id}/name`), this.state.name)
                .then(_ => this.setState({
                    uploading: this.state.uploading - 1,
                }));
        }
        else {
            this.onDataChange(this.state.data);
        }
        this.setState({
            notification: 'Alles gespeichert',
        });
    }

    onNameKey(e) {
        if (e.keyCode === 13 && this.state.name.replace(/\W/g, '') !== '') {
            this.saveName();
        }
    }

    onDataChange(data, noHistory) {
        this.saveNewBoard(data);
        if (this.state.id !== '') {
            if (this.state.online) {
                this.setState({
                    uploading: this.state.uploading + 1,
                });
                set(ref(this.db, `${this.state.id}/data`), data)
                    .then(_ => this.setState({
                        uploading: this.state.uploading - 1,
                    }));
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

    permaDelete() {
        if (this.state.online) {
            const sharedBoards = JSON.parse(localStorage.getItem('sharedBoards')).filter(p => p !== this.state.id);
            localStorage.setItem('sharedBoards', JSON.stringify(sharedBoards));
            this.setState({
                uploading: this.state.uploading + 1,
            });
            remove(ref(this.db, this.state.id))
                .then(_ => window.location.href = '/');
        }
    }

    render() {
        const rootStyle = {
            backgroundColor: this.props.theme.palette.background.default,
            position: 'fixed',
            top: '0',
            left: '0',
            minWidth: '100vw',
            minHeight: '100vh',
        };
        const onlineStyle = {
            color: this.state.online ? '#0c0' : '',
            marginLeft: '10px',
            animation: this.state.uploading > 0 ? 'blinking 700ms linear infinite' : '',
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
                            <div style={{ display: 'flex', flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                                <mui.Tooltip title='Alle Boards'>
                                    <mui.IconButton style={{ color: 'white', marginRight: '5px' }} size='large' component={Link} to='/'>
                                        <ArrowBackRoundedIcon />
                                    </mui.IconButton>
                                </mui.Tooltip>
                                <mui.Typography variant='h2' marginY='10px'>
                                    Board
                                </mui.Typography>
                                <div style={{ display: 'flex' }}>
                                    <div style={{ alignSelf: 'flex-end' }}>
                                        <mui.Tooltip title={this.state.online ? 'Online' : 'Offline'}>
                                            {React.createElement(this.state.online ? CircleIcon : OfflineBoltIcon, {
                                                fontSize: 'large',
                                                color: this.state.online ? '' : 'disabled',
                                                style: onlineStyle,
                                            })}
                                        </mui.Tooltip>
                                    </div>
                                    <div>
                                        <mui.Tooltip title='Board teilen'>
                                            <span>
                                                <mui.IconButton disabled={this.state.id === ''}
                                                    style={{ color: this.state.id === '' ? '' : 'white', marginLeft: '5px' }} size='large' onClick={_ => this.share()}>
                                                    <ShareIcon />
                                                </mui.IconButton>
                                            </span>
                                        </mui.Tooltip>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <mui.Tooltip title='Rückgängig'>
                                    <span>
                                        <mui.IconButton disabled={this.state.lastData.length === 0}
                                            style={{ color: this.state.lastData.length === 0 ? '' : 'white', marginLeft: '5px' }} size='large' onClick={_ => this.undo()}>
                                            <UndoIcon />
                                        </mui.IconButton>
                                    </span>
                                </mui.Tooltip>
                            </div>
                        </mui.Toolbar>
                        <mui.ThemeProvider theme={this.darkTheme}>
                            <mui.CssBaseline />
                            <mui.TextField fullWidth variant='outlined' label='Name' disabled={this.state.loading}
                                value={this.state.name} onChange={e => this.onNameChange(e)} onKeyDown={e => this.onNameKey(e)} />
                        </mui.ThemeProvider>
                    </mui.AppBar>

                    {this.state.loading ?
                        <mui.Box flex display='flex' justifyContent='center' marginTop='1vh'>
                            <mui.CircularProgress thickness={1} size={100} />
                        </mui.Box>
                        :
                        <BoardData name={this.state.name} data={this.state.data} onDataChange={data => this.onDataChange(data)} />
                    }

                    {this.state.online && this.state.data.length === 0 &&
                        <mui.Card style={{ width: '75%', margin: '20vh auto', padding: '20px' }}>
                            <mui.Typography variant='h2' fontSize='2rem' color='GrayText'>
                                Willst du dieses online Board permanent löschen?
                                <mui.Typography fontSize='0.75rem'>
                                    <i>Ist halt nix drin</i>
                                </mui.Typography>
                            </mui.Typography>
                            <mui.Button fullWidth style={{ marginTop: '15px' }} onClick={_ => this.setState({ permaPrompt: true })}
                                variant='outlined' size='large' color='error' startIcon={<DeleteIcon />}>
                                Für immer löschen
                            </mui.Button>
                        </mui.Card>
                    }

                    <mui.Popover open={this.state.permaPrompt} BackdropProps onClose={_ => this.setState({ permaPrompt: false })}
                        anchorOrigin={{ horizontal: 'center', vertical: 'top' }}
                        transformOrigin={{ horizontal: 'center', vertical: 'top' }}>
                        <mui.Box padding='20px'>
                            <mui.Typography variant='h4' color='error'>
                                Sicher?
                            </mui.Typography>
                            <br />
                            Wenn du ein neues Board erstellst musst du wieder allen den Link schicken.
                            <br />
                            <mui.Box marginTop='20px'>
                                <mui.ButtonGroup>
                                    <mui.Button variant='outlined' onClick={_ => this.setState({ permaPrompt: false })}>
                                        Abbrechen
                                    </mui.Button>
                                    <mui.Button variant='contained' color='error' onClick={_ => this.permaDelete()}
                                        startIcon={<DeleteIcon />}>
                                        Vernichten
                                    </mui.Button>
                                </mui.ButtonGroup>
                            </mui.Box>
                        </mui.Box>
                    </mui.Popover>

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
                                startIcon={<CloseIcon />}>
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
                        <mui.Box padding='20px'>
                            <mui.Typography variant='h4' color='error'>
                                Error
                            </mui.Typography>
                            <br />
                            {this.state.error}
                            <br />
                            <mui.Box marginTop='20px'>
                                <mui.Button variant='outlined' component={Link} to='/'
                                    startIcon={<ArrowBackRoundedIcon />}>
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

export default routerNavigate(muiTheme(BoardPage));
