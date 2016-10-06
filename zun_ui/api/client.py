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


from horizon import exceptions
from horizon.utils.memoized import memoized
import logging
from openstack_dashboard.api import base
from zunclient.v1 import client as zun_client


LOG = logging.getLogger(__name__)

CONTAINER_CREATE_ATTRS = ['name', 'image', 'command', 'cpu', 'memory',
                          'environment', 'workdir', 'ports', 'hostname',
                          'labels']


@memoized
def zunclient(request):
    zun_url = ""
    try:
        zun_url = base.url_for(request, 'container')
    except exceptions.ServiceCatalogException:
        LOG.debug('No Container Management service is configured.')
        return None

    LOG.debug('zunclient connection created using the token "%s" and url'
              '"%s"' % (request.user.token.id, zun_url))
    c = zun_client.Client(username=request.user.username,
                          project_id=request.user.tenant_id,
                          input_auth_token=request.user.token.id,
                          zun_url=zun_url)
    return c


def container_create(request, **kwargs):
    args = {}
    for (key, value) in kwargs.items():
        if key in CONTAINER_CREATE_ATTRS:
            args[str(key)] = str(value)
        else:
            raise exceptions.BadRequest(
                "Key must be in %s" % ",".join(CONTAINER_CREATE_ATTRS))
        if key == "environment":
            envs = {}
            vals = value.split(",")
            for v in vals:
                kv = v.split("=", 1)
                envs[kv[0]] = kv[1]
            args["environment"] = envs
        elif key == "labels":
            labels = {}
            vals = value.split(",")
            for v in vals:
                kv = v.split("=", 1)
                labels[kv[0]] = kv[1]
            args["labels"] = labels
        elif key == "ports":
            args["ports"] = [v for v in value.split(",")]
    return zunclient(request).containers.create(**args)


def container_delete(request, id, force=False):
    # TODO(shu-mutou): force option should be provided by user.
    return zunclient(request).containers.delete(id, force)


def container_list(request, limit=None, marker=None, sort_key=None,
                   sort_dir=None, detail=True):
    # TODO(shu-mutou): detail option should be added, if it is
    # implemented in Zun API
    return zunclient(request).containers.list(limit, marker, sort_key,
                                              sort_dir)


def container_show(request, id):
    return zunclient(request).containers.get(id)


def container_logs(request, id):
    return zunclient(request).containers.logs(id)


def container_start(request, id):
    return zunclient(request).containers.start(id)


def container_stop(request, id):
    return zunclient(request).containers.stop(id)
