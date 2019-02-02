import React from 'react';
import PropTypes from 'prop-types';
import { Scrollable } from 'components/util/Scrollable';
import { ListItem } from 'components/ListItem';
import { Res } from 'containers/util/Res';
import { KeyHandler } from 'logic/comp/key-handler';
import { Keys } from 'const/keys';
import { Tooltip } from 'components/util/Tooltip';

class List extends React.Component {
    static propTypes = {
        locale: PropTypes.object.isRequired,
        items: PropTypes.array.isRequired,
        search: PropTypes.string,
        active: PropTypes.string,
        advanced: PropTypes.object,
        advancedEnabled: PropTypes.bool,
        onItemClick: PropTypes.func.isRequired,
        onSearchChange: PropTypes.func.isRequired,
        onAdvancedSearchClick: PropTypes.func.isRequired,
        onAdvancedOptionChange: PropTypes.func.isRequired,
        onEntrySelectionMoved: PropTypes.func.isRequired,
        onSortClick: PropTypes.func.isRequired,
    };
    constructor(props) {
        super(props);
        this.listEl = React.createRef();
        this.searchInput = React.createRef();
        this.scrollable = React.createRef();
        this.listSearchBtn = React.createRef();
    }
    componentDidMount() {
        this.subscriptions = [
            KeyHandler.onKey(
                Keys.DOM_VK_F,
                this.onFindKeyPressed,
                this,
                KeyHandler.SHORTCUT_ACTION
            ),
            KeyHandler.onKey(Keys.DOM_VK_DOWN, this.onDownKeyPressed, this),
            KeyHandler.onKey(Keys.DOM_VK_UP, this.onUpKeyPressed, this),
            KeyHandler.onKeyPress(this.onDocumentKeyPressed, this),
        ];
    }
    componentWillUnmount() {
        this.subscriptions.forEach(s => s());
    }
    componentDidUpdate() {
        if (this.props.active && this.scrollable.current) {
            const itemEl = document.getElementById(this.props.active);
            const scroller = this.scrollable.current.baron.getScroller();
            if (itemEl && scroller) {
                const itemRect = itemEl.getBoundingClientRect();
                const listRect = scroller.getBoundingClientRect();
                if (itemRect.top < listRect.top) {
                    scroller.scrollTop += itemRect.top - listRect.top;
                } else if (itemRect.bottom > listRect.bottom) {
                    scroller.scrollTop += itemRect.bottom - listRect.bottom;
                }
            }
        }
    }
    onFindKeyPressed(e) {
        e.preventDefault();
        this.searchInput.current.select();
        this.searchInput.current.focus();
    }
    onDownKeyPressed(e) {
        e.preventDefault();
        const { items, active } = this.props;
        this.props.onEntrySelectionMoved({ items, active, diff: 1 });
    }
    onUpKeyPressed(e) {
        e.preventDefault();
        const { items, active } = this.props;
        this.props.onEntrySelectionMoved({ items, active, diff: -1 });
    }
    onDocumentKeyPressed(e) {
        const code = e.charCode;
        if (!code) {
            return;
        }
        this.searchInput.current.focus();
    }
    onAdvancedOptionChange = e => {
        const option = e.target.dataset.id;
        const value = e.target.checked;
        this.props.onAdvancedOptionChange({
            option,
            value,
        });
    };
    onInputChange = e => {
        const value = e.target.value;
        this.props.onSearchChange({ value });
    };
    onInputKeyDown = e => {
        switch (e.which) {
            case Keys.DOM_VK_UP:
            case Keys.DOM_VK_DOWN:
                break;
            case Keys.DOM_VK_RETURN:
                e.target.blur();
                break;
            case Keys.DOM_VK_ESCAPE:
                if (e.target.value) {
                    e.target.value = '';
                    this.onInputChange({ target: e.target });
                }
                e.target.blur();
                break;
            default:
                return;
        }
        e.preventDefault();
    };
    onSortClick = () => {
        const btnRect = this.listSearchBtn.current.getBoundingClientRect();
        const listRect = this.listEl.current.getBoundingClientRect();
        const position = { right: listRect.right, top: btnRect.bottom };
        this.props.onSortClick({ position });
    };
    render() {
        const {
            locale,
            items,
            active,
            search,
            advanced,
            advancedEnabled,
            onItemClick,
            onAdvancedSearchClick,
        } = this.props;
        return (
            <div className="list" ref={this.listEl}>
                <div className="list__header">
                    <div className="list__search">
                        <div className="list__search-header">
                            <div className="list__search-btn-menu">
                                <i className="fa fa-bars" />
                            </div>
                            <div className="list__search-field-wrap">
                                <input
                                    type="text"
                                    className="list__search-field input-padding-right"
                                    autoComplete="off"
                                    autoCapitalize="off"
                                    autoCorrect="off"
                                    spellCheck="false"
                                    defaultValue={search || ''}
                                    onChange={this.onInputChange}
                                    onKeyDown={this.onInputKeyDown}
                                    ref={this.searchInput}
                                />
                                <Tooltip
                                    className="list__search-icon-search"
                                    title={locale.searchAdvTitle}
                                    onClick={onAdvancedSearchClick}
                                >
                                    <i className="fa fa-search" />
                                    <i className="fa fa-caret-down" />
                                </Tooltip>
                            </div>
                            <Tooltip className="list__search-btn-new" title={locale.searchAddNew}>
                                <i className="fa fa-plus" />
                            </Tooltip>
                            <Tooltip
                                className="list__search-btn-sort"
                                title={locale.searchSort}
                                elRef={this.listSearchBtn}
                                onClick={this.onSortClick}
                            >
                                <i className="fa fa-sort-alpha-asc" />
                            </Tooltip>
                            {!!advancedEnabled && (
                                <div className="list__search-adv">
                                    <div className="list__search-adv-text">
                                        <Res id="searchSearchIn" />:
                                    </div>
                                    <div className="list__search-check">
                                        <input
                                            type="checkbox"
                                            id="list__searcn-adv-check-user"
                                            data-id="user"
                                            defaultChecked={advanced.user}
                                            onChange={this.onAdvancedOptionChange}
                                        />
                                        <label htmlFor="list__searcn-adv-check-user">
                                            <Res id="user" capitalize={true} />
                                        </label>
                                    </div>
                                    <div className="list__search-check">
                                        <input
                                            type="checkbox"
                                            id="list__search-adv-check-other"
                                            data-id="other"
                                            defaultChecked={advanced.other}
                                            onChange={this.onAdvancedOptionChange}
                                        />
                                        <label htmlFor="list__search-adv-check-other">
                                            <Res id="searchOther" />
                                        </label>
                                    </div>
                                    <div className="list__search-check">
                                        <input
                                            type="checkbox"
                                            id="list__search-adv-check-website"
                                            data-id="url"
                                            defaultChecked={advanced.url}
                                            onChange={this.onAdvancedOptionChange}
                                        />
                                        <label htmlFor="list__search-adv-check-website">
                                            <Res id="website" capitalize={true} />
                                        </label>
                                    </div>
                                    <div className="list__search-check">
                                        <input
                                            type="checkbox"
                                            id="list__search-adv-check-protect"
                                            data-id="protect"
                                            defaultChecked={advanced.protect}
                                            onChange={this.onAdvancedOptionChange}
                                        />
                                        <label htmlFor="list__search-adv-check-protect">
                                            <Res id="searchProtect" />
                                        </label>
                                    </div>
                                    <div className="list__search-check">
                                        <input
                                            type="checkbox"
                                            id="list__search-adv-check-notes"
                                            data-id="notes"
                                            defaultChecked={advanced.notes}
                                            onChange={this.onAdvancedOptionChange}
                                        />
                                        <label htmlFor="list__search-adv-check-notes">
                                            <Res id="notes" capitalize={true} />
                                        </label>
                                    </div>
                                    <div className="list__search-check">
                                        <input
                                            type="checkbox"
                                            id="list__search-adv-check-pass"
                                            data-id="pass"
                                            defaultChecked={advanced.pass}
                                            onChange={this.onAdvancedOptionChange}
                                        />
                                        <label htmlFor="list__search-adv-check-pass">
                                            <Res id="password" capitalize={true} />
                                        </label>
                                    </div>
                                    <div className="list__search-check">
                                        <input
                                            type="checkbox"
                                            id="list__search-adv-check-title"
                                            data-id="title"
                                            defaultChecked={advanced.title}
                                            onChange={this.onAdvancedOptionChange}
                                        />
                                        <label htmlFor="list__search-adv-check-title">
                                            <Res id="title" capitalize={true} />
                                        </label>
                                    </div>
                                    <div className="list__search-adv-text">
                                        <Res id="searchOptions" />:
                                    </div>
                                    <div className="list__search-check">
                                        <input
                                            type="checkbox"
                                            id="list__search-adv-check-cs"
                                            data-id="cs"
                                            defaultChecked={advanced.cs}
                                            onChange={this.onAdvancedOptionChange}
                                        />
                                        <label htmlFor="list__search-adv-check-cs">
                                            <Res id="searchCase" />
                                        </label>
                                    </div>
                                    <div className="list__search-check">
                                        <input
                                            type="checkbox"
                                            id="list__search-adv-check-regex"
                                            data-id="regex"
                                            checked={advanced.regex}
                                            onChange={this.onAdvancedOptionChange}
                                        />
                                        <label htmlFor="list__search-adv-check-regex">
                                            <Res id="searchRegex" />
                                        </label>
                                    </div>
                                    <div className="list__search-check">
                                        <input
                                            type="checkbox"
                                            id="list__search-adv-check-history"
                                            data-id="history"
                                            defaultChecked={advanced.history}
                                            onChange={this.onAdvancedOptionChange}
                                        />
                                        <label htmlFor="list__search-adv-check-history">
                                            <Res id="history" capitalize={true} />
                                        </label>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="list__items">
                    {items.length ? (
                        <Scrollable ref={this.scrollable}>
                            {items.map(item => (
                                <ListItem
                                    key={item.id}
                                    item={item}
                                    active={active === item.id}
                                    onClick={onItemClick}
                                />
                            ))}
                        </Scrollable>
                    ) : (
                        <div className="empty-block muted-color">
                            <div className="empty-block__icon">
                                <i className="fa fa-key" />
                            </div>
                            <h1 className="empty-block__title">
                                <Res id="listEmptyTitle" />
                            </h1>
                            <p className="empty-block__text">
                                <Res id="listEmptyAdd">
                                    <i key="add" className="fa fa-plus" />
                                </Res>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

export { List };