======
Zun-UI
======

.. image:: https://governance.openstack.org/tc/badges/zun-ui.svg

.. image:: https://www.openstack.org/themes/openstack/images/project-mascots/Zun/OpenStack_Project_Zun_mascot.jpg

See the following docs to learn more:

* Free software: Apache license
* Documentation: https://docs.openstack.org/zun-ui/latest/
* Source: https://opendev.org/openstack/zun-ui
* Bugs: https://bugs.launchpad.net/zun-ui

Manual Installation
-------------------

Install according to `Zun UI documentation <https://docs.openstack.org/zun-ui/latest/install/index.html>`_.

Enabling in DevStack
--------------------

Add this repo as an external repository into your ``local.conf`` file::

    [[local|localrc]]
    enable_plugin zun-ui https://opendev.org/openstack/zun-ui
