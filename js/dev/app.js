(function (window, document) {

    var localStorage_count = {sa: 0, so: 0}, old_hash;

    function set_row(row, value, rowspan, saal) {
        var target_id = row.dataset.id,
            target_row = document.getElementById(target_id),
            target = target_row.querySelector('td').nextElementSibling;

        if (typeof value === 'boolean' && !value) {
            if (target) {
                target_row.removeChild(target);
            }
            window.localStorage.setItem(target_id, '');
            return;
        }

        if (!target) {
            target = document.createElement('td');
            target_row.appendChild(target);
        }

        if (saal) {
            saal = document.querySelector('#auswahl th:nth-child(' + (parseInt(saal) + 1) + ')').textContent;
            value += '<span class="saal">' + saal + '</span>';
        }

        target.rowSpan = rowspan;
        target.innerHTML = value;
    }

    function set_session(session) {
        select_session.bind(session)();
    }

    function select_session(event) {
        var parent = this.parentNode,
            siblings = parent.querySelectorAll('td');

        if (event && this.classList.contains('session-selected')) {
            this.classList.remove('session-selected');
            set_row(parent, '', 1);
            window.localStorage.setItem(parent.dataset.id, '');
            rebuild_plan_url();
            return;
        }

        [].forEach.call(siblings, function (el) {
            el.classList.remove('session-selected');
        });

        if (siblings.length !== 4) {
            var prev_parent = parent.previousElementSibling,
                prev_selected = prev_parent.querySelector('.session-selected[rowspan]');
            if (prev_selected) {
                prev_selected.classList.remove('session-selected');

                window.localStorage.setItem(prev_parent.dataset.id, '');
                set_row(prev_parent, '', 1);
            }
        }

        if (this.attributes.rowspan) {
            var next_parent = parent.nextElementSibling,
                next_selected = next_parent.querySelector('.session-selected');
            if (next_selected) {
                next_selected.classList.remove('session-selected');
            }

            set_row(next_parent, false, 1);
        }

        this.classList.add('session-selected');
        set_row(parent, this.innerHTML, this.rowSpan, this.id.slice(-1));
        window.localStorage.setItem(parent.dataset.id, this.id);
        rebuild_plan_url();
    }

    [].forEach.call(document.querySelectorAll('.session'), function (el) {
        el.addEventListener('click', select_session, false);
    });

    function rebuild_plan_url() {
        var hash = '#;';

        [].forEach.call(document.querySelectorAll('tr[id]'), function (el) {
            var session_id = window.localStorage.getItem(el.id),
                session = document.getElementById(session_id);

            if (session) {
                hash += el.id + ':' + session.id + ';';
            }
        });

        document.getElementById('plan-url').value = 'https://' + window.location.host + window.location.pathname + hash;
    }

    function hashchange(event) {
        if (event) {
            event.preventDefault();
        }
        var hash = window.location.hash.slice(1), target = false, date,
            hash_target = document.getElementById(hash);

        if (!hash_target || hash === 'auto') {
            if (!localStorage_count.sa || !localStorage_count.so) {
                target = 'auswahl';
            } else {
                date = new Date();
                if (date.getDate() >= 15 && date.getMonth() >= 5 && date.getYear() >= 2014) {
                    target = 'sonntag';
                } else {
                    target = 'samstag';
                }
            }

            hash_target = document.getElementById(target);
        }

        if (hash_target) {
            hash_target.classList.add('active');
            document.getElementById('link-' + hash).classList.add('pure-button-primary');
            if (old_hash) {
                document.getElementById('link-' + old_hash).classList.remove('pure-button-primary');
                document.getElementById(old_hash).classList.remove('active');
            }
        } else {
            if (hash.slice(0, 1) === ';') {
                var parts = hash.split(';');
                delete parts[0];
                if (!parts[ parts.length - 1 ]) {
                    delete parts[ parts.length - 1 ];
                }

                parts.forEach(function (item) {
                    item = item.split(':');
                    var session = document.getElementById(item[1]);

                    if (session) {
                        set_session(session);
                        localStorage_count[ session.id.slice(0, 2) ]++;
                    }
                });
            }

            window.location.hash = '#auto';
        }

        if (hash.slice(0, 1) !== ';') {
            old_hash = hash;
        }
        window.scrollTo(0, 0);
    }

    window.addEventListener('load', function () {
        [].forEach.call(document.querySelectorAll('tr[id]'), function (el) {
            var session_id = window.localStorage.getItem(el.id),
                session = document.getElementById(session_id);

            if (typeof session_id !== 'string' || !session_id) {
                return;
            }

            localStorage_count[ session.id.slice(0, 2) ]++;
            set_session(session);
        });
        hashchange();
        rebuild_plan_url();

        if (window.location.protocol !== 'https:' && window.location.host.indexOf('github.io') > -1) {
            window.location = document.getElementById('plan-url').value;
        }

        document.getElementById('reset').addEventListener('click', function () {
            window.localStorage.clear();
            window.location.hash = '';
            window.location.reload();
        });
    }, false);

    window.addEventListener('hashchange', hashchange);

}(window, document));