import React from 'react';
import * as mui from '@mui/material';

class BoardData extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        return (
            <mui.List>
                {this.props.data.map((d, i) =>
                    <mui.ListItem key={i}>
                        {d}
                    </mui.ListItem>
                )}
            </mui.List>
        );
    }
}

export default BoardData;
