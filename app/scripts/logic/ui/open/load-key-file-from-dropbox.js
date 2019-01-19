import { DropboxChooser } from 'logic/comp/dropbox-chooser';
import { displayKeyFile } from 'store/ui/open/display-key-file';
import { uuid } from 'util/generators/id-generator';

export function loadKeyFileFromDropbox() {
    return (dispatch, getState) => {
        const state = getState();
        if (state.uiOpen.busy) {
            return Promise.resolve();
        }
        new DropboxChooser((err, res) => {
            if (err) {
                return;
            }
            const keyFileInfo = {
                id: uuid(),
                name: res.name,
                data: res.data,
            };
            return dispatch(displayKeyFile(keyFileInfo));
        }).choose();
    };
}
