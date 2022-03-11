import React from 'react';
import * as mui from '@mui/material';

class HelpPopover extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            accordion1: false,
            accordion2: false,
        };
    }

    render() {
        return (
            <mui.Popover open={this.props.open} onClose={_ => this.props.onClose()} BackdropProps
                anchorOrigin={{ horizontal: 'center', vertical: 'top' }}
                transformOrigin={{ horizontal: 'center', vertical: 'top' }}>
                <mui.Box padding='30px' width='80vw'>
                    <mui.Typography variant='h4'>
                        Hilfe
                    </mui.Typography>
                    <br />
                    <mui.Accordion expanded={this.state.accordion1} onChange={_ => this.setState({ accordion1: !this.state.accordion1 })}>
                        <mui.AccordionSummary expandIcon={<mui.Icon>expand_more</mui.Icon>}>
                            <mui.Typography>
                                Version 1.2.1
                            </mui.Typography>
                        </mui.AccordionSummary>
                        <mui.AccordionDetails>
                            <mui.Typography>
                                - Versionen eingeführt
                            </mui.Typography>
                        </mui.AccordionDetails>
                    </mui.Accordion>
                    <mui.Accordion expanded={this.state.accordion2} onChange={_ => this.setState({ accordion2: !this.state.accordion2 })}>
                        <mui.AccordionSummary expandIcon={<mui.Icon>expand_more</mui.Icon>}>
                            <mui.Typography>
                                Bedienung
                            </mui.Typography>
                        </mui.AccordionSummary>
                        <mui.AccordionDetails>
                            <mui.Typography>
                                <mui.Table>
                                    {[
                                        [<b>Tastatur Shortcuts</b>],
                                        [<>Enter (Name-Input)</>, <>Board speichern</>],
                                        [<>Shift+Enter</>, <>Nächste Eingabe</>],
                                        [<>Escape</>, <>Eingabe abbrechen</>],
                                        [<>Strg+Z</>, <>Rückgängig</>],
                                        [<>Strg+V</>, <>Kopierten Link öffnen</>],
                                        [<>Strg+Y</>, <>Board teilen</>],
                                    ].map(e =>
                                        <mui.TableRow>
                                            {e.map(e2 =>
                                                <mui.TableCell>
                                                    {e2}
                                                </mui.TableCell>
                                            )}
                                        </mui.TableRow>
                                    )}
                                </mui.Table>
                            </mui.Typography>
                        </mui.AccordionDetails>
                    </mui.Accordion>
                    <p><i>Mirco Heitmann, 2022</i></p>
                    <mui.ButtonGroup>
                        <mui.Button variant='outlined' onClick={_ => this.props.onClose()}>
                            Schließen
                        </mui.Button>
                    </mui.ButtonGroup>
                </mui.Box>
            </mui.Popover >
        );
    }
}

export default HelpPopover;
