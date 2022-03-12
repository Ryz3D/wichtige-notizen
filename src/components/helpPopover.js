import React from 'react';
import * as mui from '@mui/material';

class HelpPopover extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            accordion1: false,
            accordion2: false,
            accordion3: false,
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
                                Version 1.2.3
                            </mui.Typography>
                        </mui.AccordionSummary>
                        <mui.AccordionDetails>
                            <mui.Typography>
                                - Versionen eingeführt
                                - Menü schließen bei Shift+Enter
                                - Seiten-Titel
                            </mui.Typography>
                        </mui.AccordionDetails>
                    </mui.Accordion>
                    <mui.Accordion expanded={this.state.accordion2} onChange={_ => this.setState({ accordion2: !this.state.accordion2 })}>
                        <mui.AccordionSummary expandIcon={<mui.Icon>expand_more</mui.Icon>}>
                            <mui.Typography>
                                Umgang mit Daten
                            </mui.Typography>
                        </mui.AccordionSummary>
                        <mui.AccordionDetails>
                            <mui.Typography>
                                <b>Lokale Boards</b> sind komplett lokal. Es wird nichts zu irgendeinem Server geschickt oder in irgendeiner Cloud gespeichert.
                                <br />
                                Das bedeutet aber auch, dass beim Löschen der Browser-Daten (genauer gesagt vom <i>local storage</i>) die lokalen Boards verloren gehen. Wenn man alles lokal haben möchte kann ein Backup über das Menü unten rechts gemacht werden, das Board wird als .csv Datei exportiert.
                                <br />
                                <br />
                                <b>Geteilte Boards</b> werden auf einem zentralen Server gespeichert. Da es keine Accounts gibt, kann jeder mit dem Link das Board bearbeiten. Will man das Board sichern, kann man eine Kopie als lokales Board machen (oder ein .csv Backup).
                                <br />
                                Um die Daten von einem lokalen Board in ein geteiltes Board zu kopieren, kann ein .csv Export von dem lokalen Board gemacht werden und im geteilten Board importiert werden.
                            </mui.Typography>
                        </mui.AccordionDetails>
                    </mui.Accordion>
                    <mui.Accordion expanded={this.state.accordion3} onChange={_ => this.setState({ accordion3: !this.state.accordion3 })}>
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
                                        [<>Enter (Bei Namen-Eingabe)</>, <>Board speichern</>],
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
