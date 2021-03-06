import React from 'react';
import * as mui from '@mui/material';
import routerNavigate from '../wrapper/routerNavigate';
import muiTheme from '../wrapper/muiTheme';
import LinkButton from '../components/linkButton';
import HelpPopover from '../components/helpPopover';
import { getDatabase, ref, onValue } from 'firebase/database';
import Hotkeys from 'react-hot-keys';
import Helmet from 'react-helmet';
import {
    Brightness3 as Brightness3Icon,
    Brightness7 as Brightness7Icon,
    ContentPasteGo as ContentPasteGoIcon,
    Delete as DeleteIcon,
    Help as HelpIcon,
    MoreVert as MoreVertIcon,
} from '@mui/icons-material';

class HomePage extends React.Component {
    constructor(props) {
        super(props);
        this.db = getDatabase();
        this.state = {
            localBoards: [],
            sharedBoards: [],
            loading: true,
            deleteLocal: '',
            deleteShared: '',
            deleteName: '',
            notification: '',
            help: false,
        };
        this.sharedToLoad = 1;
        this.settingsBtnRef = React.createRef();
    }

    reloadBoards() {
        const localIDs = JSON.parse(localStorage.getItem('localBoards') || '[]');
        const localBoards = [];
        for (var id of localIDs) {
            localBoards.push({
                id,
                name: JSON.parse(localStorage.getItem(id) || '{}').name,
            });
        }

        const sharedIDs = JSON.parse(localStorage.getItem('sharedBoards') || '[]');
        this.sharedToLoad = sharedIDs.length;
        this.setState({
            localBoards: localBoards,
            sharedBoards: [],
            loading: sharedIDs.length > 0,
        }, _ => {
            for (var i of sharedIDs) {
                const idBuf = i;
                onValue(ref(this.db, `${idBuf}/name`), v => {
                    var duplicate = false;
                    if (v.val()) {
                        const sharedBoards = this.state.sharedBoards;
                        const duplIndex = sharedBoards.findIndex(p => p.id === idBuf);
                        if (duplIndex !== -1) {
                            duplicate = true;
                            sharedBoards[duplIndex].name = v.val();
                        }
                        else {
                            sharedBoards.push({
                                id: idBuf,
                                name: v.val(),
                            });
                        }
                        this.setState({
                            sharedBoards
                        });
                    }
                    if (this.state.loading && !duplicate) {
                        this.sharedToLoad--;
                        if (this.sharedToLoad === 0) {
                            this.setState({
                                loading: false,
                            });
                        }
                    }
                });
            }
        });
    }

    componentDidMount() {
        this.reloadBoards();
    }

    deleteLocal(b) {
        this.setState({
            deleteLocal: b.id,
            deleteName: b.name,
        });
    }

    deleteShared(b) {
        this.setState({
            deleteShared: b.id,
            deleteName: b.name,
        });
    }

    deleteFinal() {
        if (this.state.deleteShared !== '') {
            const sharedIDs = JSON.parse(localStorage.getItem('sharedBoards') || '[]');
            localStorage.setItem('sharedBoards', JSON.stringify(sharedIDs.filter(p => p !== this.state.deleteShared)));
        }
        else {
            const localIDs = JSON.parse(localStorage.getItem('localBoards') || '[]');
            localStorage.setItem('localBoards', JSON.stringify(localIDs.filter(p => p !== this.state.deleteLocal)));
        }
        this.setState({
            deleteLocal: '',
            deleteShared: '',
        }, _ => this.reloadBoards());
    }

    clipboardPaste() {
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.readText()
                .then(text => {
                    const clipboardLink = (text || '').match(/\/board\?id=\w+/g);
                    if (clipboardLink) {
                        this.props.navigate(clipboardLink[0]);
                    }
                    else {
                        this.setState({ notification: 'Kein Board-Link kopiert' });
                    }
                })
                .catch(_ => this.setState({ notification: 'Kein Zugriff auf Zwischenablage' }));
        }
    }

    toggleDark() {
        const dark = this.props.theme.palette.mode === 'light';
        this.props.setDark(dark);
        localStorage.setItem('darkMode', dark ? '1' : '0');
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
        const btnStyle = {
            textTransform: 'none',
        };

        return (
            <>
                <Hotkeys
                    keyName='ctrl+v'
                    onKeyDown={_ => this.clipboardPaste()}
                />
                <div style={rootStyle}>
                    <Helmet>
                        <title>
                            Notizen
                        </title>
                    </Helmet>
                    <mui.AppBar position='static'>
                        <mui.Toolbar>
                            <div style={{ display: 'flex', flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                                <mui.Typography variant='h2' marginY='10px' fontSize='3rem'>
                                    Alle Boards
                                </mui.Typography>
                                <div>
                                    <mui.Tooltip title='Kopierten Link ??ffnen'>
                                        <mui.IconButton style={{ color: 'white', marginLeft: '5px' }}
                                            size='large' onClick={_ => this.clipboardPaste()}>
                                            <ContentPasteGoIcon />
                                        </mui.IconButton>
                                    </mui.Tooltip>
                                </div>
                            </div>
                            <div>
                                <mui.Tooltip title='Hilfe'>
                                    <mui.IconButton style={{ color: 'white', marginLeft: '5px' }}
                                        size='large' onClick={_ => this.setState({ help: true })}>
                                        <HelpIcon />
                                    </mui.IconButton>
                                </mui.Tooltip>
                                <mui.IconButton style={{ color: 'white', marginLeft: '5px' }} ref={this.settingsBtnRef}
                                    size='large' onClick={_ => this.setState({ settingsOpen: !this.state.settingsOpen })}>
                                    <MoreVertIcon />
                                </mui.IconButton>
                                <mui.Popover open={this.state.settingsOpen} onClose={_ => this.setState({ settingsOpen: false })}
                                    anchorEl={this.settingsBtnRef.current} anchorOrigin={{
                                        vertical: 'bottom',
                                        horizontal: 'center',
                                    }}>
                                    {[[
                                        this.props.theme.palette.mode === 'light' ? <Brightness3Icon /> : <Brightness7Icon />,
                                        this.props.theme.palette.mode === 'light' ? 'Dark mode' : 'Light mode',
                                        _ => this.toggleDark(),
                                    ]].map(e =>
                                        <mui.ListItemButton onClick={e[2]}>
                                            <mui.ListItemIcon>
                                                {e[0]}
                                            </mui.ListItemIcon>
                                            <mui.ListItemText>
                                                {e[1]}
                                            </mui.ListItemText>
                                        </mui.ListItemButton>
                                    )}
                                </mui.Popover>
                            </div>
                        </mui.Toolbar>
                    </mui.AppBar>
                    <div style={{ marginBottom: '3vh' }}>
                        {this.state.localBoards.length === 0 &&
                            <mui.Alert severity='info'>
                                Du hast keine Boards
                            </mui.Alert>
                        }
                        <mui.List>
                            {this.state.localBoards.reverse().map((b, i) =>
                                <mui.ListItem divider key={i}>
                                    <mui.ButtonGroup fullWidth>
                                        <LinkButton size='large' variant='outlined' style={btnStyle} url={`/board?id=${b.id}`}>
                                            {b.name}
                                        </LinkButton>
                                        <mui.Button color='error' style={{ width: '50px' }} onClick={_ => this.deleteLocal(b)}>
                                            <DeleteIcon />
                                        </mui.Button>
                                    </mui.ButtonGroup>
                                </mui.ListItem>
                            )}
                            <mui.ListItem>
                                <LinkButton tooltip='Neues Board' size='large' fullWidth variant='outlined' url={`/board`}>
                                    <mui.Typography variant='h5'>
                                        +
                                    </mui.Typography>
                                </LinkButton>
                            </mui.ListItem>
                        </mui.List>
                    </div>
                    {(this.state.loading || this.state.sharedBoards.length > 0) &&
                        <div style={{ marginBottom: '3vh' }}>
                            <mui.Typography variant='h4' marginTop='3vh' marginLeft='15px'>
                                Geteilte Boards
                            </mui.Typography>
                            {this.state.loading ?
                                <mui.Box flex display='flex' justifyContent='center' marginTop='1vh'>
                                    <mui.CircularProgress thickness={1} size={100} />
                                </mui.Box>
                                :
                                <mui.List>
                                    {this.state.sharedBoards.reverse().map((b, i) =>
                                        <mui.ListItem key={i} divider={i < this.state.sharedBoards.length - 1}>
                                            <mui.ButtonGroup fullWidth>
                                                <LinkButton size='large' variant='outlined' style={btnStyle} url={`/board?id=${b.id}`}>
                                                    {b.name}
                                                </LinkButton>
                                                <mui.Button color='error' style={{ width: '50px' }} onClick={_ => this.deleteShared(b)}>
                                                    <DeleteIcon />
                                                </mui.Button>
                                            </mui.ButtonGroup>
                                        </mui.ListItem>
                                    )}
                                </mui.List>
                            }
                        </div>
                    }
                    <mui.Popover open={this.state.deleteLocal !== '' || this.state.deleteShared !== ''} BackdropProps
                        onClose={_ => this.setState({ deleteLocal: '', deleteShared: '' })}
                        anchorOrigin={{ horizontal: 'center', vertical: 'top' }}
                        transformOrigin={{ horizontal: 'center', vertical: 'top' }}>
                        <mui.Box padding='30px'>
                            <mui.Typography variant='h3'>
                                Board l??schen?
                            </mui.Typography>
                            <br />
                            {this.state.deleteShared !== '' &&
                                <><b>"{this.state.deleteName}"</b> ist ein ??ffentliches Board, du kannst ??ber den Link wieder darauf zugreifen.</>
                            }
                            {this.state.deleteLocal &&
                                <><b>"{this.state.deleteName}"</b> ist ein lokales Board, es wird f??r immer vernichtet.</>
                            }
                            <br />
                            <br />
                            <mui.ButtonGroup>
                                <mui.Button variant='outlined' onClick={_ => this.setState({ deleteLocal: '', deleteShared: '' })}>
                                    Abbrechen
                                </mui.Button>
                                <mui.Button variant='contained' color='error' onClick={_ => this.deleteFinal()}>
                                    <DeleteIcon />
                                    Wech damit
                                </mui.Button>
                            </mui.ButtonGroup>
                        </mui.Box>
                    </mui.Popover>

                    <HelpPopover open={this.state.help} onClose={_ => this.setState({ help: false })} />

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

export default routerNavigate(muiTheme(HomePage));
