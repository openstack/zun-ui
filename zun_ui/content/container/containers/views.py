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

from django.views import generic
from zun_ui.api import client


class SerialConsoleView(generic.TemplateView):
    template_name = 'serial_console.html'

    def get_context_data(self, **kwargs):
        context = super(SerialConsoleView, self).get_context_data(**kwargs)
        context['page_title'] = self.kwargs['container_id']
        try:
            console_url = client.container_attach(self.request,
                                                  self.kwargs['container_id'])
            context["console_url"] = console_url
            context["protocols"] = "['binary', 'base64']"
        except Exception:
            context["error_message"] = "Cannot get console for container %s." \
                % self.kwargs['container_id']
        return context
