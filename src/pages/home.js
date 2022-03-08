import React from 'react';
import * as mui from '@mui/material';
import { Link } from 'react-router-dom';
import { getDatabase, ref, get } from 'firebase/database';

class HomePage extends React.Component {
    constructor(props) {
        super(props);
        this.db = getDatabase();
        this.state = {
            localBoards: [],
            sharedBoards: [],
            sharedToLoad: 1,
            loading: true,
        };
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
        this.setState({
            localBoards: localBoards,
            sharedBoards: [],
            sharedToLoad: sharedIDs.length,
            loading: sharedIDs.length > 0,
        });
        for (var i of sharedIDs) {
            const idBuf = i;
            get(ref(this.db, `${idBuf}/name`))
                .then(v => {
                    if (v.val()) {
                        this.setState({
                            sharedBoards: [...this.state.sharedBoards, {
                                id: idBuf,
                                name: v.val(),
                            }],
                        });
                    }
                    this.setState({
                        sharedToLoad: this.state.sharedToLoad - 1,
                        loading: this.state.sharedToLoad > 1,
                    });
                })
                .catch(_ => { });
        }
    }

    componentDidMount() {
        this.reloadBoards();
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
                                        <mui.Button size='large' fullWidth variant='outlined'
                                            component={Link} to={`/board?id=${b.id}`}>
                                            <mui.Icon>columns</mui.Icon>
                                            {b.name}
                                        </mui.Button>
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
                                        <mui.Button size='large' fullWidth variant='outlined'
                                            component={Link} to={`/board?id=${b.id}`}>
                                            <mui.Icon>columns</mui.Icon>
                                            {b.name}
                                        </mui.Button>
                                    </mui.ListItem>
                                )}
                            </mui.List>
                        </div>
                    </>
                }
            </div>
        );
    }
}

export default HomePage;
