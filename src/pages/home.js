import React from 'react';
import * as mui from '@mui/material';
import { Link } from 'react-router-dom';
import { getDatabase, ref, onValue } from 'firebase/database';

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
        };
        this.sharedToLoad = 1;
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

    render() {
        const rootStyle = {
            backgroundColor: '#fff',
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
            <div style={rootStyle}>
                <mui.AppBar position='static'>
                    <mui.Toolbar>
                        <mui.Typography variant='h2' marginY='10px'>
                            Alle Boards
                        </mui.Typography>
                    </mui.Toolbar>
                </mui.AppBar>
                {this.state.loading ?
                    <mui.Box flex display='flex' justifyContent='center' marginTop='15vh'>
                        <mui.CircularProgress thickness={1} size={80} />
                    </mui.Box>
                    :
                    <>
                        <div style={{ marginBottom: '3vh' }}>
                            {(this.state.localBoards || {}).length === 0 &&
                                <mui.Alert severity='info'>
                                    Du hast keine Boards
                                </mui.Alert>
                            }
                            <mui.List>
                                {this.state.localBoards.map((b, i) =>
                                    <mui.ListItem divider key={i}>
                                        <mui.ButtonGroup fullWidth>
                                            <mui.Button size='large' fullWidth variant='outlined'
                                                component={Link} to={`/board?id=${b.id}`} style={btnStyle}>
                                                {b.name}
                                            </mui.Button>
                                            <mui.Button color='error' style={{ width: '50px' }} onClick={_ => this.deleteLocal(b)}>
                                                <mui.Icon>delete</mui.Icon>
                                            </mui.Button>
                                        </mui.ButtonGroup>
                                    </mui.ListItem>
                                )}
                                <mui.ListItem>
                                    <mui.Tooltip title='Neues Board'>
                                        <mui.Button size='large' fullWidth variant='outlined'
                                            component={Link} to={`/board`}>
                                            <mui.Typography variant='h5'>
                                                +
                                            </mui.Typography>
                                        </mui.Button>
                                    </mui.Tooltip>
                                </mui.ListItem>
                            </mui.List>
                        </div>
                        <div style={{ marginBottom: '3vh' }}>
                            {this.state.sharedBoards.length > 0 &&
                                <mui.Typography variant='h4' marginTop='3vh' marginLeft='15px'>
                                    Geteilte Boards
                                </mui.Typography>
                            }
                            <mui.List>
                                {this.state.sharedBoards.map((b, i) =>
                                    <mui.ListItem key={i} divider={i < this.state.sharedBoards.length - 1}>
                                        <mui.ButtonGroup>
                                            <mui.Button size='large' fullWidth variant='outlined'
                                                component={Link} to={`/board?id=${b.id}`} style={btnStyle}>
                                                {b.name}
                                            </mui.Button>
                                            <mui.Button color='error' style={{ width: '50px' }} onClick={_ => this.deleteShared(b)}>
                                                <mui.Icon>delete</mui.Icon>
                                            </mui.Button>
                                        </mui.ButtonGroup>
                                    </mui.ListItem>
                                )}
                            </mui.List>
                        </div>
                        <mui.Popover open={this.state.deleteLocal !== '' || this.state.deleteShared !== ''}>
                            <mui.Box padding='30px'>
                                <mui.Typography variant='h3'>
                                    Board löschen?
                                </mui.Typography>
                                <br />
                                {this.state.deleteShared !== '' ?
                                    <>
                                        <b>"{this.state.deleteName}"</b> ist ein öffentliches Board, du kannst über den Link wieder darauf zugreifen
                                    </>
                                    :
                                    <>
                                        <b>"{this.state.deleteName}"</b> ist ein lokales Board, es wird für immer vernichtet
                                    </>
                                }
                                <br />
                                <br />
                                <mui.ButtonGroup>
                                    <mui.Button variant='outlined' onClick={_ => this.setState({ deleteLocal: '', deleteShared: '' })}>
                                        Abbrechen
                                    </mui.Button>
                                    <mui.Button variant='contained' color='error' onClick={_ => this.deleteFinal()}>
                                        <mui.Icon>delete</mui.Icon>
                                        Wech damit
                                    </mui.Button>
                                </mui.ButtonGroup>
                            </mui.Box>
                        </mui.Popover>
                    </>
                }
            </div>
        );
    }
}

export default HomePage;
