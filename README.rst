==========
zun-ui
==========

Zun UI

* Free software: Apache license
* Source: https://git.openstack.org/cgit/openstack/zun-ui
* Bugs: https://bugs.launchpad.net/zun-ui

Enabling in DevStack
--------------------

Add this repo as an external repository into your ``local.conf`` file::

    [[local|localrc]]
    enable_plugin zun-ui https://github.com/openstack/zun-ui

Manual Installation
-------------------

Begin by cloning the Horizon and Zun UI repositories::

    git clone https://github.com/openstack/horizon
    git clone https://github.com/openstack/zun-ui

Create a virtual environment and install Horizon dependencies::

    cd horizon
    python tools/install_venv.py

Set up your ``local_settings.py`` file::

    cp openstack_dashboard/local/local_settings.py.example openstack_dashboard/local/local_settings.py

Open up the copied ``local_settings.py`` file in your preferred text
editor. You will want to customize several settings:

-  ``OPENSTACK_HOST`` should be configured with the hostname of your
   OpenStack server. Verify that the ``OPENSTACK_KEYSTONE_URL`` and
   ``OPENSTACK_KEYSTONE_DEFAULT_ROLE`` settings are correct for your
   environment. (They should be correct unless you modified your
   OpenStack server to change them.)

Install Zun UI with all dependencies in your virtual environment::

    tools/with_venv.sh pip install -e ../zun-ui/

And enable it in Horizon::

    cp ../zun-ui/zun_ui/enabled/_1330_project_container_panelgroup.py openstack_dashboard/local/enabled
    cp ../zun-ui/zun_ui/enabled/_1331_project_container_containers_panel.py openstack_dashboard/local/enabled
    cp ../zun-ui/zun_ui/enabled/_2330_project_container_panelgroup.py openstack_dashboard/local/enabled
    cp ../zun-ui/zun_ui/enabled/_2331_project_container_images_panel.py openstack_dashboard/local/enabled

To run horizon with the newly enabled Zun UI plugin run::

    python manage.py runserver 0.0.0.0:8080

to have the application start on port 8080 and the horizon dashboard will be
available in your browser at http://localhost:8080/
