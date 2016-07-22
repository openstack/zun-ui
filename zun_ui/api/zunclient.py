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


from __future__ import absolute_import
import logging
#from zunclient.v1 import client as zun_client

from horizon import exceptions
from horizon.utils.memoized import memoized
from openstack_dashboard.api import base

# for stab, should remove when use CLI API
import copy
import uuid


LOG = logging.getLogger(__name__)

CONTAINER_CREATE_ATTRS = ['name']

STUB_DATA = {}

# for stab, should be removed when use CLI API
class StubResponse(object):

    def __init__(self, info):
        self._info = info

    def __repr__(self):
        reprkeys = sorted(k for k in self.__dict__.keys() if k[0] != '_')
        info = ", ".join("%s=%s" % (k, getattr(self, k)) for k in reprkeys)
        return "<%s %s>" % (self.__class__.__name__, info)

    def to_dict(self):
        return copy.deepcopy(self._info)


@memoized
def zunclient(request):
    zun_url = ""
    """"
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
    """


def container_create(request, **kwargs):
    args = {}
    for (key, value) in kwargs.items():
        if key in CONTAINER_CREATE_ATTRS:
            args[str(key)] = str(value)
        else:
            raise exceptions.BadRequest(
                "Key must be in %s" % ",".join(CONTAINER_CREATE_ATTRS))
        if key == "labels":
            labels = {}
            vals = value.split(",")
            for v in vals:
                kv = v.split("=", 1)
                labels[kv[0]] = kv[1]
            args["labels"] = labels
    #created = zunclient(request).containers.create(**args)

    # create dummy response
    args["uuid"] = uuid.uuid1().hex
    created = StubResponse(args)
    for k in args:
        setattr(created, k, args[k])
    STUB_DATA[created.uuid] = created

    return created


def container_delete(request, id):
    #deleted = zunclient(request).containers.delete(id)
    deleted = STUB_DATA.pop(id)

    return deleted


def container_list(request, limit=None, marker=None, sort_key=None,
                  sort_dir=None, detail=True):
    #list = zunclient(request).containers.list(limit, marker, sort_key,
    #                                            sort_dir, detail)
    list = [STUB_DATA[data] for data in STUB_DATA]
    return list


def container_show(request, id):
    #show = zunclient(request).containers.get(id)
    show = STUB_DATA.get(id)
    return show
