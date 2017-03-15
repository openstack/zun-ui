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

from django.conf.urls import url
from django.utils.translation import ugettext_lazy as _
from horizon.browsers import views
from zun_ui.content.container.containers import views as zun_views

title = _("Containers")
urlpatterns = [
    url(r'^(?P<container_id>[^/]+)/console',
        zun_views.SerialConsoleView.as_view(), name='console'),
    url('', views.AngularIndexView.as_view(title=title), name='index'),
]
