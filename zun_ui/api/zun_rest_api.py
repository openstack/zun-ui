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

from zun_ui.api import zunclient

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
        return change_to_id(zunclient.container_show(request, id).to_dict())


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
        result = zunclient.container_list(request)
        return {'items': [change_to_id(n.to_dict()) for n in result]}

    @rest_utils.ajax(data_required=True)
    def delete(self, request):
        """Delete one or more Containers by id.

        Returns HTTP 204 (no content) on successful deletion.
        """
        for id in request.DATA:
            zunclient.container_delete(request, id)

    @rest_utils.ajax(data_required=True)
    def post(self, request):
        """Create a new Container.

        Returns the new Container object on success.
        """
        new_container = zunclient.container_create(request, **request.DATA)
        return rest_utils.CreatedResponse(
            '/api/zun/container/%s' % new_container.uuid,
            new_container.to_dict())
