/**
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
(function () {
  'use strict';

  angular
    .module('horizon.app.core.openstack-service-api')
    .factory('horizon.app.core.openstack-service-api.zun', ZunAPI);

  ZunAPI.$inject = [
    'horizon.framework.util.http.service',
    'horizon.framework.widgets.toast.service',
    'horizon.framework.util.i18n.gettext'
  ];

  function ZunAPI(apiService, toastService, gettext) {
    var service = {
      createContainer: createContainer,
      getContainer: getContainer,
      getContainers: getContainers,
      deleteContainer: deleteContainer,
      deleteContainers: deleteContainers,
    };

    return service;

    ///////////////
    // Containers //
    ///////////////

    function createContainer(params) {
      return apiService.post('/api/zun/containers/', params)
        .error(function() {
          toastService.add('error', gettext('Unable to create Container'));
        });
    }

    function getContainer(id) {
      return apiService.get('/api/zun/containers/' + id)
        .error(function() {
          toastService.add('error', gettext('Unable to retrieve the Container.'));
        });
    }

    function getContainers() {
      return apiService.get('/api/zun/containers/')
        .error(function() {
          toastService.add('error', gettext('Unable to retrieve the Containers.'));
        });
    }

    function deleteContainer(id, suppressError) {
      var promise = apiService.delete('/api/zun/containers/', [id]);
      return suppressError ? promise : promise.error(function() {
        var msg = gettext('Unable to delete the Container with id: %(id)s');
        toastService.add('error', interpolate(msg, { id: id }, true));
      });
    }

    // FIXME(shu-mutou): Unused for batch-delete in Horizon framework in Feb, 2016.
    function deleteContainers(ids) {
      return apiService.delete('/api/zun/containers/', ids)
        .error(function() {
          toastService.add('error', gettext('Unable to delete the Containers.'));
        })
    }
  }
}());
