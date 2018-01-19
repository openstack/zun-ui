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

  function ZunAPI(apiService, toast, gettext) {
    var containersPath = '/api/zun/containers/';
    var imagesPath = '/api/zun/images/';
    var service = {
      createContainer: createContainer,
      updateContainer: updateContainer,
      getContainer: getContainer,
      getContainers: getContainers,
      deleteContainer: deleteContainer,
      deleteContainers: deleteContainers,
      deleteContainerForce: deleteContainerForce,
      deleteContainerStop: deleteContainerStop,
      startContainer: startContainer,
      stopContainer: stopContainer,
      logsContainer: logsContainer,
      restartContainer: restartContainer,
      pauseContainer: pauseContainer,
      unpauseContainer: unpauseContainer,
      executeContainer: executeContainer,
      killContainer: killContainer,
      resizeContainer: resizeContainer,
      pullImage: pullImage,
      getImages: getImages
    };

    return service;

    ///////////////
    // Containers //
    ///////////////

    function createContainer(params) {
      var msg = gettext('Unable to create Container.');
      return apiService.post(containersPath, params).error(error(msg));
    }

    function updateContainer(id, params) {
      var msg = gettext('Unable to update Container.');
      return apiService.patch(containersPath + id, params).error(error(msg));
    }

    function getContainer(id, suppressError) {
      var promise = apiService.get(containersPath + id);
      return suppressError ? promise : promise.error(function() {
        var msg = gettext('Unable to retrieve the Container.');
        toastService.add('error', msg);
      });
    }

    function getContainers() {
      var msg = gettext('Unable to retrieve the Containers.');
      return apiService.get(containersPath).error(error(msg));
    }

    function deleteContainer(id, suppressError) {
      var promise = apiService.delete(containersPath, [id]);
      return suppressError ? promise : promise.error(function() {
        var msg = gettext('Unable to delete the Container with id: %(id)s');
        toastService.add('error', interpolate(msg, { id: id }, true));
      });
    }

    // FIXME(shu-mutou): Unused for batch-delete in Horizon framework in Feb, 2016.
    function deleteContainers(ids) {
      var msg = gettext('Unable to delete the Containers.');
      return apiService.delete(containersPath, ids).error(error(msg));
    }

    function deleteContainerForce(id, suppressError) {
      var promise = apiService.delete(containersPath + id + '/force', [id]);
      return suppressError ? promise : promise.error(function() {
        var msg = gettext('Unable to delete forcely the Container with id: %(id)s');
        toastService.add('error', interpolate(msg, { id: id }, true));
      });
    }

    function deleteContainerStop(id, suppressError) {
      var promise = apiService.delete(containersPath + id + '/stop', [id]);
      return suppressError ? promise : promise.error(function() {
        var msg = gettext('Unable to stop and delete the Container with id: %(id)s');
        toastService.add('error', interpolate(msg, { id: id }, true));
      });
    }

    function startContainer(id) {
      var msg = gettext('Unable to start Container.');
      return apiService.post(containersPath + id + '/start').error(error(msg));
    }

    function stopContainer(id, params) {
      var msg = gettext('Unable to stop Container.');
      return apiService.post(containersPath + id + '/stop', params).error(error(msg));
    }

    function logsContainer(id) {
      var msg = gettext('Unable to get logs of Container.');
      return apiService.get(containersPath + id + '/logs').error(error(msg));
    }

    function restartContainer(id, params) {
      var msg = gettext('Unable to restart Container.');
      return apiService.post(containersPath + id + '/restart', params).error(error(msg));
    }

    function pauseContainer(id) {
      var msg = gettext('Unable to pause Container');
      return apiService.post(containersPath + id + '/pause').error(error(msg));
    }

    function unpauseContainer(id) {
      var msg = gettext('Unable to unpause of Container.');
      return apiService.post(containersPath + id + '/unpause').error(error(msg));
    }

    function executeContainer(id, params) {
      var msg = gettext('Unable to execute the command.');
      return apiService.post(containersPath + id + '/execute', params).error(error(msg));
    }

    function killContainer(id, params) {
      var msg = gettext('Unable to send kill signal.');
      return apiService.post(containersPath + id + '/kill', params).error(error(msg));
    }

    function resizeContainer(id, params) {
      var msg = gettext('Unable to resize console.');
      return apiService.post(containersPath + id + '/resize', params).error(error(msg));
    }

    ////////////
    // Images //
    ////////////

    function pullImage(params) {
      var msg = gettext('Unable to pull Image.');
      return apiService.post(imagesPath, params).error(error(msg));
    }

    function getImages() {
      var msg = gettext('Unable to retrieve the Images.');
      return apiService.get(imagesPath).error(error(msg));
    }

    function error(message) {
      return function() {
        toast.add('error', message);
      };
    }
  }
}());
