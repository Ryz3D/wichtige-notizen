import React from 'react';
import * as mui from '@mui/material';
import routerNavigate from './routerNavigate';

class LinkButton extends React.Component {
    render() {
        const btn = (
            <mui.Button onClick={_ => this.props.navigate(this.props.url, { replace: this.props.replace })}
                {...this.props} navigate={undefined}>
                {this.props.children}
            </mui.Button>
        );

        return (
            this.props.toolip ?
                <mui.Tooltip title={this.props.tooltip}>
                    {btn}
                </mui.Tooltip>
                :
                btn
        );
    }
}

export default routerNavigate(LinkButton);
