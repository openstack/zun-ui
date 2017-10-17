# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

from django.conf import settings

from horizon import views


class CloudShellView(views.HorizonTemplateView):
    template_name = 'cloud_shell/cloud_shell.html'

    def get_context_data(self, **kwargs):
        context = super(CloudShellView, self).get_context_data(**kwargs)
        if hasattr(settings, "CLOUD_SHELL_IMAGE"):
            context['CLOUD_SHELL_IMAGE'] = settings.CLOUD_SHELL_IMAGE
        else:
            context['CLOUD_SHELL_IMAGE'] = "gbraad/openstack-client:alpine"
        return context
