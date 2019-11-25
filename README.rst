==========
zun-ui
==========

Zun UI

* Free software: Apache license
* Source: https://opendev.org/openstack/zun-ui
* Bugs: https://bugs.launchpad.net/zun-ui

Manual Installation
-------------------

Install according to `Zun UI documentation <https://docs.openstack.org/zun-ui/latest/install/index.html>`_.

Enabling in DevStack
--------------------

Add this repo as an external repository into your ``local.conf`` file::

    [[local|localrc]]
    enable_plugin zun-ui https://github.com/openstack/zun-ui

