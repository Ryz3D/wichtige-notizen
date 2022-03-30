import React from 'react';
import * as mui from '@mui/material';
import { isMobile } from 'react-device-detect';
import { Buffer } from 'buffer';
import { v4 as uuidv4 } from 'uuid';
import routerNavigate from '../wrapper/routerNavigate';
import muiTheme from '../wrapper/muiTheme';
import {
    AttachFile as AttachFileIcon,
    BackupTable as BackupTableIcon,
    BorderColor as BorderColorIcon,
    Close as CloseIcon,
    ContentPaste as ContentPasteIcon,
    ControlCamera as ControlCameraIcon,
    Delete as DeleteIcon,
    Download as DownloadIcon,
    MoreVert as MoreVertIcon,
    OpenInBrowser as OpenInBrowserIcon,
} from '@mui/icons-material';

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
            lineBreak: 'anywhere',
        };

        return (
            <mui.ListItem disablePadding style={{ margin: '16px 8px' }}>
                <mui.Box width='200px'>
                    {this.props.edit ?
                        <mui.TextField autoFocus multiline onKeyDown={e => this.onKey(e)} variant={(this.props.data || {}).h ? 'filled' : 'outlined'}
                            label='Text' onContextMenu={this.props.onContext} value={this.state.text} onChange={e => this.onChange(e)} />
                        :
                        <mui.Button fullWidth style={btnStyle} variant={(this.props.data || {}).h ? 'contained' : 'outlined'}
                            onContextMenu={this.props.onContext} onClick={this.props.onClick} disabled={this.props.disabled}
                            color={this.props.thisMove ? 'success' : (this.props.itemMove ? 'warning' : 'primary')}>
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
            itemMove: false,
            downloadSrc: '',
            downloadName: '',
        };

        this.downloadRef = React.createRef();
        this.uploadRef = React.createRef();
    }

    addList() {
        if (this.state.itemMove) {
            if (this.state.menuList !== -1 && this.state.menuItem !== -1) {
                const tempData = JSON.parse(JSON.stringify(this.props.data));
                const item = tempData[this.state.menuList].splice(this.state.menuItem, 1)[0];
                tempData.push([0, item]);
                this.props.onDataChange(tempData);
            }
            this.setState({
                menuList: -1,
                menuItem: -1,
                entryMenuAnchor: null,
                itemMove: false,
            });
        }
        else {
            this.props.onDataChange([
                ...this.props.data,
                [0],
            ]);
        }
    }

    addItem(index) {
        const shouldMove = this.state.itemMove && this.state.menuList !== -1 && this.state.menuItem !== -1;
        const tempData = JSON.parse(JSON.stringify(this.props.data));
        const newIndex = tempData[index].length;
        var newItem = { t: '' };
        if (shouldMove) {
            newItem = tempData[this.state.menuList].splice(this.state.menuItem, 1)[0];
        }

        if (!shouldMove && this.state.editList !== -1 && this.state.editItem !== -1) {
            this.editSave(editedData => {
                editedData[index].push(newItem);
                this.props.onDataChange(editedData);
            });
        }
        else {
            tempData[index].push(newItem);
            this.props.onDataChange(tempData);
        }

        if (shouldMove) {
            this.setState({
                editList: -1,
                editItem: -1,
                menuList: -1,
                menuItem: -1,
                entryMenuAnchor: null,
                itemMove: false,
                justAdded: false,
            });
        }
        else {
            this.setState({
                editList: index,
                editItem: newIndex,
                menuList: -1,
                menuItem: -1,
                entryMenuAnchor: null,
                editData: null,
                justAdded: true,
            });
        }
    }

    editClear() {
        const isEmpty = (this.state.editData || { t: '' }).t.replace(/[ \t\r\n]/g, '') === '';
        if (this.state.editList !== -1 && this.state.editItem !== -1 && (this.state.editData === null ? this.state.justAdded : isEmpty)) {
            this.editDelete();
        }

        this.setState({
            editList: -1,
            editItem: -1,
            editData: null,
            entryMenuAnchor: null,
        });
    }

    editItem(e, i, i2) {
        if (this.state.itemMove) {
            if (this.state.menuList !== -1 && this.state.menuItem !== -1) {
                const tempData = JSON.parse(JSON.stringify(this.props.data));
                const item = tempData[this.state.menuList].splice(this.state.menuItem, 1)[0];
                const offset = this.state.menuList === i && this.state.menuItem < i2 && this.state.menuItem !== i2 - 1 ? -1 : 0;
                tempData[i] = [
                    ...tempData[i].slice(0, i2 + offset),
                    item,
                    ...tempData[i].slice(i2 + offset),
                ];
                this.props.onDataChange(tempData);
            }
            this.setState({
                menuList: -1,
                menuItem: -1,
                entryMenuAnchor: null,
                itemMove: false,
            });
        }
        else {
            const editState = {
                editList: i,
                editItem: i2,
                editData: null,
                justAdded: false,
            };
            if (isMobile) {
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
    }

    editNext() {
        if (this.state.editItem < this.props.data[this.state.editList].length - 1) {
            this.setState({
                editList: this.state.editList,
                editItem: this.state.editItem + 1,
                editData: null,
                justAdded: false,
                entryMenuAnchor: null,
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

    editSave(cb) {
        const isEmpty = (this.state.editData || { t: '' }).t.replace(/[ \t\r\n]/g, '') === '';
        if (this.state.editList !== -1 && this.state.editItem !== -1 && (this.state.editData === null ? this.state.justAdded : isEmpty)) {
            this.editDelete();
        }
        if (this.state.editData !== null && !isEmpty) {
            const tempData = JSON.parse(JSON.stringify(this.props.data));
            tempData[this.state.editList][this.state.editItem] = {
                ...this.state.editData,
                t: this.state.editData.t.trim(),
            };
            if (cb) {
                cb(tempData);
            }
            else {
                this.props.onDataChange(tempData, false);
            }
        }
    }

    editDelete() {
        const tempData = JSON.parse(JSON.stringify(this.props.data));
        tempData[this.state.editList].splice(this.state.editItem, 1);
        this.props.onDataChange(tempData);
    }

    rootClick(e) {
        if (['LI', 'UL', 'DIV'].find(p => p === e.target.tagName) && !e.target.className.match(/\WnotRoot\W/g)) {
            this.editSave();
            this.editClear();
            this.setState({
                menuList: -1,
                menuItem: -1,
                entryMenuAnchor: null,
                itemMove: false,
            });
        }
    }

    menuClose() {
        this.setState({
            entryMenuAnchor: null,
        });
    }

    menuItem(e, i, i2) {
        e.preventDefault();
        this.editClear();
        const isInput = e.currentTarget.className.match(/\WMuiTextField-root\W/g);
        this.setState({
            menuList: i,
            menuItem: i2,
            entryMenuAnchor: isInput ? e.currentTarget.parentNode : e.currentTarget,
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

    menuMove() {
        this.setState({
            itemMove: true,
            entryMenuAnchor: null,
        });
    }

    menuClip() {
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(this.props.data[this.state.menuList][this.state.menuItem].t);
        }
        this.menuClose();
    }

    menuOpen() {
        window.open(this.props.data[this.state.menuList][this.state.menuItem].t, '_blank').focus();
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

    export() {
        console.log(this.props.data);
        var data = '';
        for (var i = 1; ; i++) {
            var allDone = true;
            var dataRow = '';
            for (var lists of this.props.data) {
                if (lists[i] !== undefined) {
                    allDone = false;
                    dataRow += `${lists[i].h ? '*' : ''}"${lists[i].t.replaceAll('"', '\\"').replaceAll('\n', '\\n')}",`;
                }
                else
                    dataRow += '"",';
            }
            if (allDone)
                break;
            else
                data += dataRow.slice(0, -1) + '\n';
        }
        const based = Buffer.from(data).toString('base64');
        this.setState({
            downloadSrc: `data:text/plain;base64,${based}`,
            downloadName: `${this.props.name}.csv`,
        }, _ => this.downloadRef.current.click());
    }

    import(e) {
        if (e.target.files) {
            if (e.target.files[0]) {
                const fr = new FileReader();
                fr.onloadend = e2 => {
                    const importData = [];
                    for (var line of e2.target.result.replaceAll('\r', '').split('\n')) {
                        var open = false;
                        var start = 0;
                        var h = false;
                        const entries = [];
                        for (var i = 0; i < line.length; i++) {
                            if (line[i] === '"' && (i === 0 || line[i - 1] !== '\\')) {
                                open = !open;
                                if (open) {
                                    h = false;
                                    if (i !== 0) {
                                        h = line[i - 1] === '*';
                                    }
                                    start = i + 1;
                                }
                                else {
                                    entries.push({
                                        t: line.slice(start, i).replaceAll('\\"', '"').replaceAll('\\n', '\n'),
                                        h,
                                    });
                                }
                            }
                        }
                        for (var i2 = 0; i2 < entries.length; i2++) {
                            if (entries[i2].t) {
                                while (i2 >= importData.length) {
                                    importData.push([0]);
                                }
                                importData[i2].push(entries[i2]);
                            }
                        }
                    }
                    this.props.onDataChange(importData);
                };
                fr.readAsText(e.target.files[0]);
            }
        }
    }

    backup() {
        const newID = uuidv4();
        localStorage.setItem(newID, JSON.stringify({
            name: `${this.props.name} (Kopie)`,
            data: this.props.data,
        }));
        const localBoards = JSON.parse(localStorage.getItem('localBoards'));
        localStorage.setItem('localBoards', JSON.stringify([...localBoards, newID]));
        this.props.navigate(`/board?id=${newID}`);
    }

    render() {
        const rootStyle = {
            width: '100vw',
            position: 'absolute',
            bottom: '0',
            top: '148px',
            overflow: 'auto',
        };

        console.log(this.props.theme.palette)
        const mobileMenuStyle = {
            background: this.props.theme.palette.background.default,
            border: this.props.theme.palette.action.disabledBackground + ' solid 2px',
            borderRadius: '3px',
            color: this.props.theme.palette.text.primary,
        };

        const itemMenu = [
            [<DeleteIcon />, 'Löschen', _ => this.menuDelete()],
            [<BorderColorIcon />, 'Markieren', _ => this.menuHighlight()],
            [<ControlCameraIcon />, 'Verschieben', _ => this.menuMove()],
            [<ContentPasteIcon />, 'Kopieren', _ => this.menuClip()],
            [<OpenInBrowserIcon />, 'Als Link öffnen', _ => this.menuOpen()],
        ].map((e, i) =>
            <mui.MenuItem className='notRoot' key={i} onClick={e[2]}>
                <mui.ListItemIcon>
                    {e[0]}
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
                                e === 0 ? <></> :
                                    <BoardEntry key={i2} onClick={e => this.editItem(e, i, i2)} onContext={e => this.menuItem(e, i, i2)} onNext={_ => this.editNext()} onClear={_ => this.editClear()}
                                        set={d => this.editSet(d)} save={_ => this.editSave()} edit={this.state.editList === i && this.state.editItem === i2} data={e} itemMove={this.state.itemMove}
                                        thisMove={(this.state.entryMenuAnchor !== null || this.state.itemMove) && i === this.state.menuList && i2 === this.state.menuItem} />
                            )}
                            <BoardEntry itemMove={this.state.itemMove} onClick={_ => this.addItem(i)}>
                                {this.state.itemMove ?
                                    'Ranhängen'
                                    :
                                    '+ Notiz'
                                }
                            </BoardEntry>
                            <mui.ListItem>
                                <mui.Box width='200px' display='flex'>
                                    <mui.IconButton style={{ margin: 'auto' }} onClick={_ => this.setState({ deleteList: i })}>
                                        <DeleteIcon />
                                    </mui.IconButton>
                                </mui.Box>
                            </mui.ListItem>
                        </mui.List>
                    )}
                    <mui.List>
                        <BoardEntry itemMove={this.state.itemMove} onClick={_ => this.addList()}>
                            {this.state.itemMove ?
                                'In neue Liste'
                                :
                                '+ Liste'
                            }
                        </BoardEntry>
                    </mui.List>
                </mui.Stack>
                {isMobile ?
                    <>
                        <div style={{ height: '70px' }}></div>
                        <mui.Popper disableEnforceFocus={true} disableScrollLock={true} disableAutoFocus={true}
                            open={this.state.entryMenuAnchor !== null} anchorEl={this.state.entryMenuAnchor}>
                            <mui.MenuList style={mobileMenuStyle}>
                                {itemMenu}
                            </mui.MenuList>
                        </mui.Popper>
                    </>
                    :
                    <mui.Menu open={this.state.entryMenuAnchor !== null} anchorEl={this.state.entryMenuAnchor}
                        onClose={_ => this.setState({ entryMenuAnchor: null })}>
                        {itemMenu}
                    </mui.Menu>
                }
                <mui.SpeedDial
                    ariaLabel=''
                    style={{ position: 'fixed', bottom: '30px', right: '30px' }}
                    icon={<mui.SpeedDialIcon icon={<MoreVertIcon />} openIcon={<CloseIcon />} />}>
                    {[
                        ['CSV-Export', <DownloadIcon />, _ => this.export()],
                        ['CSV-Import', <AttachFileIcon />, _ => this.uploadRef.current.click()],
                        ['Lokale Kopie', <BackupTableIcon />, _ => this.backup()],
                    ].map((e, i) => (
                        <mui.SpeedDialAction
                            key={i}
                            tooltipTitle={e[0]}
                            icon={e[1]}
                            onClick={e[2]}
                        />
                    ))}
                </mui.SpeedDial>
                <a ref={this.downloadRef} href={this.state.downloadSrc} download={this.state.downloadName} style={{ display: 'none' }}>csv</a>
                <input ref={this.uploadRef} type='file' accept='.csv' style={{ display: 'none' }} onChange={e => this.import(e)} />
                <mui.Popover open={this.state.deleteList > -1} BackdropProps onClose={_ => this.setState({ deleteList: -1 })}
                    anchorOrigin={{ horizontal: 'center', vertical: 'top' }}
                    transformOrigin={{ horizontal: 'center', vertical: 'top' }}>
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
                                <DeleteIcon />
                                Wech damit
                            </mui.Button>
                        </mui.ButtonGroup>
                    </mui.Box>
                </mui.Popover>
            </div>
        );
    }
}

export default routerNavigate(muiTheme(BoardData));
