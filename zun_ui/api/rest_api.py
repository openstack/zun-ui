#    Licensed under the Apache License, Version 2.0 (the "License"); you may
#    not use this file except in compliance with the License. You may obtain
#    a copy of the License at
#
#         http://www.apache.org/licenses/LICENSE-2.0
#
#    Unless required by applicable law or agreed to in writing, software
#    distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
#    WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
#    License for the specific language governing permissions and limitations
#    under the License.

from django.views import generic

from zun_ui.api import client

from openstack_dashboard.api.rest import urls
from openstack_dashboard.api.rest import utils as rest_utils


def change_to_id(obj):
    """Change key named 'uuid' to 'id'

    Zun returns objects with a field called 'uuid' many of Horizons
    directives however expect objects to have a field called 'id'.
    """
    obj['id'] = obj.pop('uuid')
    return obj


@urls.register
class Container(generic.View):
    """API for retrieving a single container"""
    url_regex = r'zun/containers/(?P<id>[^/]+)$'

    @rest_utils.ajax()
    def get(self, request, id):
        """Get a specific container"""
        return change_to_id(client.container_show(request, id).to_dict())

    @rest_utils.ajax(data_required=True)
    def patch(self, request, id):
        """Update a Container.

        Returns the Container object on success.
        """
        args = client.container_update(request, id, **request.DATA)
        return args


@urls.register
class ContainerActions(generic.View):
    """API for retrieving a single container"""
    url_regex = r'zun/containers/(?P<id>[^/]+)/(?P<action>[^/]+)$'

    @rest_utils.ajax()
    def get(self, request, id, action):
        """Get a specific container info"""
        if action == 'logs':
            return client.container_logs(request, id)

    @rest_utils.ajax()
    def post(self, request, id, action):
        """Execute a action of the Containers."""
        if action == 'start':
            return client.container_start(request, id)
        elif action == 'stop':
            timeout = request.DATA.get("timeout") or 10
            return client.container_stop(request, id, timeout)
        elif action == 'restart':
            timeout = request.DATA.get("timeout") or 10
            return client.container_restart(request, id, timeout)
        elif action == 'rebuild':
            return client.container_rebuild(request, id, **request.DATA)
        elif action == 'pause':
            return client.container_pause(request, id)
        elif action == 'unpause':
            return client.container_unpause(request, id)
        elif action == 'execute':
            command = request.DATA.get("command")
            return client.container_execute(request, id, command)
        elif action == 'kill':
            signal = request.DATA.get("signal") or None
            return client.container_kill(request, id, signal)
        elif action == 'attach':
            return client.container_attach(request, id)
        elif action == 'resize':
            width = request.DATA.get("width") or 500
            height = request.DATA.get("height") or 400
            return client.container_resize(request, id, width, height)
        elif action == 'network_attach':
            return client.container_network_attach(request, id)
        elif action == 'network_detach':
            return client.container_network_detach(request, id)
        elif action == 'port_update_security_groups':
            return client.port_update_security_groups(request)

    @rest_utils.ajax(data_required=True)
    def delete(self, request, id, action):
        """Delete specified Container with option.

        Returns HTTP 204 (no content) on successful deletion.
        """
        opts = {'id': id}
        if action == 'force':
            opts['force'] = True
        elif action == 'stop':
            opts['stop'] = True
        return client.container_delete(request, **opts)


@urls.register
class Containers(generic.View):
    """API for Zun Containers"""
    url_regex = r'zun/containers/$'

    @rest_utils.ajax()
    def get(self, request):
        """Get a list of the Containers for a project.

        The returned result is an object with property 'items' and each
        item under this is a Container.
        """
        result = client.container_list(request)
        return {'items': [change_to_id(n.to_dict()) for n in result]}

    @rest_utils.ajax(data_required=True)
    def delete(self, request):
        """Delete one or more Containers by id.

        Returns HTTP 204 (no content) on successful deletion.
        """
        for id in request.DATA:
            opts = {'id': id}
            client.container_delete(request, **opts)

    @rest_utils.ajax(data_required=True)
    def post(self, request):
        """Create a new Container.

        Returns the new Container object on success.
        If 'run' attribute is set true, do 'run' instead 'create'
        """
        new_container = client.container_create(request, **request.DATA)
        return rest_utils.CreatedResponse(
            '/api/zun/container/%s' % new_container.uuid,
            new_container.to_dict())


@urls.register
class AvailabilityZones(generic.View):
    """API for Zun AvailabilityZones"""
    url_regex = r'zun/availability_zones/$'

    @rest_utils.ajax()
    def get(self, request):
        """Get a list of the Zun AvailabilityZones.

        The returned result is an object with property 'items' and each
        item under this is a Zun AvailabilityZones.
        """
        result = client.availability_zone_list(request)
        return {'items': [i.to_dict() for i in result]}


@urls.register
class Capsules(generic.View):
    """API for Capsules"""
    url_regex = r'zun/capsules/$'

    @rest_utils.ajax()
    def get(self, request):
        """Get a list of the Capsules.

        The returned result is an object with property 'items' and each
        item under this is a Capsules.
        """
        result = client.capsule_list(request)
        return {'items': [i.to_dict() for i in result]}

    @rest_utils.ajax(data_required=True)
    def delete(self, request):
        """Delete one or more Capsules by id.

        Returns HTTP 204 (no content) on successful deletion.
        """
        for id in request.DATA:
            opts = {'id': id}
            client.capsule_delete(request, **opts)

    @rest_utils.ajax(data_required=True)
    def post(self, request):
        """Create a new Capsule.

        Returns the new Capsule object on success.
        """
        new_capsule = client.capsule_create(request, **request.DATA)
        return rest_utils.CreatedResponse(
            '/api/zun/capsules/%s' % new_capsule.uuid,
            new_capsule.to_dict())


@urls.register
class Capsule(generic.View):
    """API for retrieving a single capsule"""
    url_regex = r'zun/capsules/(?P<id>[^/]+)$'

    @rest_utils.ajax()
    def get(self, request, id):
        """Get a specific capsule"""
        return change_to_id(client.capsule_show(request, id).to_dict())


@urls.register
class Images(generic.View):
    """API for Zun Images"""
    url_regex = r'zun/images/$'

    @rest_utils.ajax()
    def get(self, request):
        """Get a list of the Images for admin users.

        The returned result is an object with property 'items' and each
        item under this is a Image.
        """
        result = client.image_list(request)
        return {'items': [change_to_id(i.to_dict()) for i in result]}

    @rest_utils.ajax(data_required=True)
    def delete(self, request):
        """Delete one or more Images by id.

        Returns HTTP 204 (no content) on successful deletion.
        """
        for id in request.DATA:
            client.image_delete(request, id)

    @rest_utils.ajax(data_required=True)
    def post(self, request):
        """Create a new Image.

        Returns the new Image object on success.
        """
        new_image = client.image_create(request, **request.DATA)
        return rest_utils.CreatedResponse(
            '/api/zun/image/%s' % new_image.uuid,
            new_image.to_dict())


@urls.register
class Hosts(generic.View):
    """API for Zun Hosts"""
    url_regex = r'zun/hosts/$'

    @rest_utils.ajax()
    def get(self, request):
        """Get a list of the Hosts for admin users.

        The returned result is an object with property 'items' and each
        item under this is a HOst.
        """
        result = client.host_list(request)
        return {'items': [change_to_id(i.to_dict()) for i in result]}


@urls.register
class Host(generic.View):
    """API for retrieving a single host"""
    url_regex = r'zun/hosts/(?P<id>[^/]+)$'

    @rest_utils.ajax()
    def get(self, request, id):
        """Get a specific host"""
        return change_to_id(client.host_show(request, id).to_dict())
