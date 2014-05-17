(function (window, document) {

    var localStorage_count = {sa: 0, so: 0}, old_hash;

    function set_row(row, value, rowspan) {
        var target_id = row.dataset.id,
            target_row = document.getElementById(target_id),
            target = target_row.querySelector('td').nextElementSibling;

        if (typeof value === 'boolean' && !value) {
            target_row.removeChild(target);
            window.localStorage.setItem(target_id, '');
            return;
        }

        console.log( row, value, rowspan, target_id, target_row, target );
        if (!target) {
            target = document.createElement('td');
            target_row.appendChild(target);
        }

        target.rowSpan = rowspan;
        target.innerHTML = value;
    }

    function select_session() {
        var parent = this.parentNode,
            siblings = parent.querySelectorAll('td');

        [].forEach.call(siblings, function (el) {
            el.classList.remove('session-selected');
        });

        if (siblings.length !== 4) {
            var prev_parent = parent.previousElementSibling,
                prev_selected = prev_parent.querySelector('.session-selected[rowspan]');
            if (prev_selected) {
                prev_selected.classList.remove('session-selected');

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
        set_row(parent, this.innerHTML, this.rowSpan);
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

        document.getElementById('plan-url').value = window.location.protocol + '//' + window.location.host + window.location.pathname + hash;
    }

    function hashchange() {
        var hash = window.location.hash.slice(1),
            hash_target = document.getElementById(hash);

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
                delete parts[ parts.length - 1 ];

                parts.forEach(function (item) {
                    item = item.split(':');
                    var row = document.getElementById(item[1]),
                        parent = row.parentNode;

                    if (row) {
                        localStorage_count[ item[1].slice(0, 2) ]++;
                        row.classList.add('session-selected');
                        window.localStorage.setItem(item[0], item[1]);
                        set_row(parent, row.innerHTML, row.rowSpan);
                    }
                });
            }

            if (!localStorage_count.sa || !localStorage_count.so) {
                window.location.hash = '#auswahl';
            } else {
                var date = new Date();
                if (date.getDate() >= 15 && date.getMonth() >= 5 && date.getYear() >= 2014) {
                    window.location.hash = '#sonntag';
                } else {
                    window.location.hash = '#samstag';
                }
            }
        }

        old_hash = hash;
    }

    window.addEventListener('load', function () {
        [].forEach.call(document.querySelectorAll('tr[id]'), function (el) {
            var session_id = window.localStorage.getItem(el.id),
                session = document.getElementById(session_id);

            if (typeof session_id !== 'string') {
                return;
            }

            if (!session_id) {
                el.removeChild(el.querySelector('td').nextElementSibling);
                return;
            }

            localStorage_count[ session_id.slice(0, 2) ]++;
            session.classList.add('session-selected');
            set_row(session.parentNode, session.innerHTML, session.rowSpan);
        });
        hashchange();
        rebuild_plan_url();
    }, false);

    window.addEventListener('hashchange', hashchange);

}(window, document));