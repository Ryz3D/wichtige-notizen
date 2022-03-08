import React from 'react';
import * as mui from '@mui/material';
import { isMobile } from 'react-device-detect';

class BoardEntry extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            text: (this.props.data || {}).t,
        };
        this.lastText = this.state.text;
    }

    componentDidUpdate() {
        if (this.lastText !== (this.props.data || {}).t) {
            this.lastText = (this.props.data || {}).t;
            this.setState({
                text: this.lastText,
            });
        }
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

    fillIfEmpty(text) {
        if (text.replace(' ', '')) {
            return text;
        }
        else {
            return '⠀';
        }
    }

    render() {
        const btnStyle = {
            textAlign: 'left',
            textTransform: 'none',
        };

        return (
            <mui.ListItem>
                <mui.Box width='200px'>
                    {this.props.edit ?
                        <mui.TextField autoFocus multiline onKeyDown={e => this.onKey(e)} variant={(this.props.data || {}).h ? 'filled' : 'outlined'}
                            label='Text' onContextMenu={this.props.onContext} value={this.state.text} onChange={e => this.onChange(e)} />
                        :
                        <mui.Button fullWidth style={btnStyle} variant={(this.props.data || {}).h ? 'contained' : 'outlined'}
                            onContextMenu={this.props.onContext} onClick={this.props.onClick}>
                            {this.fillIfEmpty(this.props.children || (this.props.data || {}).t)}
                        </mui.Button>
                    }
                </mui.Box>
            </mui.ListItem>
        );
    }
}

class BoardData extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            editList: -1,
            editItem: -1,
            menuList: -1,
            menuItem: -1,
            editData: null,
            justAdded: false,
            entryMenuAnchor: null,
            deleteList: -1,
        };
    }

    addList() {
        this.props.onDataChange([
            ...this.props.data,
            [],
        ]);
    }

    addItem(index) {
        const tempData = JSON.parse(JSON.stringify(this.props.data));
        tempData[index].push({ t: '' });
        this.props.onDataChange(tempData);
        this.setState({
            editList: index,
            editItem: tempData[index].length - 1,
            menuList: -1,
            menuItem: -1,
            entryMenuAnchor: null,
            editData: null,
            justAdded: true,
        });
    }

    editClear() {
        const isEmpty = (this.state.editData || { t: '' }).t.replace(/[ \t\r\n]/g, '') === '';
        if (this.state.editList !== -1 && this.state.editItem !== -1 && this.state.justAdded && (this.state.editData === null || isEmpty)) {
            this.editDelete();
        }

        this.setState({
            editList: -1,
            editItem: -1,
            editData: null,
        });
    }

    editItem(e, i, i2) {
        const editState = {
            editList: i,
            editItem: i2,
            editData: null,
            justAdded: false,
        };
        if (isMobile) {
            console.log(e.currentTarget.parentNode)
            this.setState({
                ...editState,
                menuList: i,
                menuItem: i2,
                entryMenuAnchor: e.currentTarget.parentNode,
            });
        }
        else {
            this.setState(editState);
        }
    }

    editNext() {
        if (this.state.editItem < this.props.data[this.state.editList].length - 1) {
            this.setState({
                editList: this.state.editList,
                editItem: this.state.editItem + 1,
                editData: null,
                justAdded: false,
            });
        } else {
            this.editClear();
        }
    }

    editSet(d) {
        this.setState({
            editData: d,
        });
    }

    editSave() {
        const isEmpty = (this.state.editData || { t: '' }).t.replace(/[ \t\r\n]/g, '') === '';
        if (this.state.editList !== -1 && this.state.editItem !== -1 && this.state.justAdded && (this.state.editData === null || isEmpty)) {
            this.editDelete();
        }
        if (this.state.editData !== null && !isEmpty) {
            const tempData = JSON.parse(JSON.stringify(this.props.data));
            tempData[this.state.editList][this.state.editItem] = {
                ...this.state.editData,
                t: this.state.editData.t.trim(),
            };
            this.props.onDataChange(tempData);
        }
    }

    editDelete() {
        const tempData = JSON.parse(JSON.stringify(this.props.data));
        tempData[this.state.editList].splice(this.state.editItem, 1);
        this.props.onDataChange(tempData);
    }

    rootClick(e) {
        if (!e.target.type) {
            this.editSave();
            this.editClear();
            if (isMobile) {
                this.menuClose();
            }
        }
    }

    menuClose() {
        this.setState({
            menuList: -1,
            menuItem: -1,
            entryMenuAnchor: null,
        });
    }

    menuItem(e, i, i2) {
        e.preventDefault();
        this.setState({
            menuList: i,
            menuItem: i2,
            entryMenuAnchor: e.currentTarget,
        });
        return false;
    }

    menuDelete() {
        const tempData = JSON.parse(JSON.stringify(this.props.data));
        tempData[this.state.menuList].splice(this.state.menuItem, 1);
        this.props.onDataChange(tempData);
        this.menuClose();
    }

    menuHighlight() {
        const tempData = JSON.parse(JSON.stringify(this.props.data));
        tempData[this.state.menuList][this.state.menuItem] = {
            ...tempData[this.state.menuList][this.state.menuItem],
            h: !tempData[this.state.menuList][this.state.menuItem].h
        };
        this.props.onDataChange(tempData);
        this.menuClose();
    }

    deleteList() {
        const tempData = JSON.parse(JSON.stringify(this.props.data));
        tempData.splice(this.state.deleteList, 1);
        this.props.onDataChange(tempData);
        this.setState({
            deleteList: -1,
        });
    }

    render() {
        const rootStyle = {
            width: '100vw',
            position: 'absolute',
            bottom: '0',
            top: '148px',
            overflow: 'auto',
        };

        const itemMenu = [
            ['delete', 'Löschen', _ => this.menuDelete()],
            ['border_color', 'Markieren', _ => this.menuHighlight()],
        ].map((e, i) =>
            <mui.MenuItem key={i} onClick={e[2]}>
                <mui.ListItemIcon>
                    <mui.Icon>{e[0]}</mui.Icon>
                </mui.ListItemIcon>
                {e[1]}
            </mui.MenuItem>
        );

        return (
            <div style={rootStyle} onClick={e => this.rootClick(e)}>
                <mui.Stack direction='row'>
                    {this.props.data.map((d, i) =>
                        <mui.List key={i}>
                            {d.map((e, i2) =>
                                <BoardEntry key={i2} onClick={e => this.editItem(e, i, i2)} onContext={e => this.menuItem(e, i, i2)} onNext={_ => this.editNext()} onClear={_ => this.editClear()}
                                    set={d => this.editSet(d)} save={_ => this.editSave()} edit={this.state.editList === i && this.state.editItem === i2} data={e} />
                            )}
                            <BoardEntry onClick={_ => this.addItem(i)}>
                                + Notiz
                            </BoardEntry>
                            <mui.ListItem>
                                <mui.Box width='200px' display='flex'>
                                    <mui.IconButton style={{ margin: 'auto' }} onClick={_ => this.setState({ deleteList: i })}>
                                        <mui.Icon>delete</mui.Icon>
                                    </mui.IconButton>
                                </mui.Box>
                            </mui.ListItem>
                        </mui.List>
                    )}
                    <mui.List>
                        <BoardEntry onClick={_ => this.addList()}>
                            + Liste
                        </BoardEntry>
                    </mui.List>
                </mui.Stack>
                {isMobile ?
                    <mui.Popper disableEnforceFocus={true} disableScrollLock={true} disableAutoFocus={true}
                        open={this.state.entryMenuAnchor !== null} anchorEl={this.state.entryMenuAnchor}>
                        <mui.MenuList style={{ background: 'white', border: '#eee solid 3px', borderRadius: '5px' }}>
                            {itemMenu}
                        </mui.MenuList>
                    </mui.Popper>
                    :
                    <mui.Menu open={this.state.entryMenuAnchor !== null} anchorEl={this.state.entryMenuAnchor}
                        onClose={_ => this.setState({ entryMenuAnchor: null })}>
                        {itemMenu}
                    </mui.Menu>
                }
                <mui.Popover open={this.state.deleteList > -1}>
                    <mui.Box padding='30px'>
                        <mui.Typography variant='h4'>
                            Liste löschen?
                        </mui.Typography>
                        <br />
                        <mui.ButtonGroup>
                            <mui.Button variant='outlined' onClick={_ => this.setState({ deleteList: -1 })}>
                                Abbrechen
                            </mui.Button>
                            <mui.Button variant='contained' color='error' onClick={_ => this.deleteList()}>
                                <mui.Icon>delete</mui.Icon>
                                Wech damit
                            </mui.Button>
                        </mui.ButtonGroup>
                    </mui.Box>
                </mui.Popover>
            </div>
        );
    }
}

export default BoardData;
