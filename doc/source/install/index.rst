============
Installation
============

Manual Installation
-------------------

Install Horizon according to `Horizon documentation <https://docs.openstack.org/horizon/>`_.

.. note::

  If your Horizon was installed by python3, Zun UI needs to be installed by
  python3 as well. For example, replace ``pip`` with ``pip3`` and replace
  ``python`` with ``python3`` for commands below.

Clone Zun UI from git repository, checkout branch same as Horizon and Zun, and install it::

    git clone https://github.com/openstack/zun-ui
    cd zun-ui
    git checkout <branch which you want>
    pip install .

Enable Zun UI in your Horizon::

    cp zun_ui/enabled/* <path to your horizon>/openstack_dashboard/local/enabled/

Run collectstatic command::

    python <path to your horizon>/manage.py collectstatic

Compress static files (if enabled)::

    python <path to your horizon>/manage.py compress

Then restart your Horizon.

After restart your Horizon, reload dashboard forcely using [Ctrl + F5] or etc. in your browser.

Enabling in DevStack
--------------------

Add this repo as an external repository into your ``local.conf`` file::

    [[local|localrc]]
    enable_plugin zun-ui https://github.com/openstack/zun-ui

