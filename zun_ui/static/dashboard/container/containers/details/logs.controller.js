/*
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
(function() {
  "use strict";

  angular
    .module('horizon.dashboard.container.containers')
    .controller('horizon.dashboard.container.containers.LogsController', controller);

  controller.$inject = [
    '$scope',
    'horizon.app.core.openstack-service-api.zun'
  ];

  function controller(
    $scope, zun
  ) {
    var ctrl = this;
    ctrl.container = {};
    ctrl.logs = {};

    $scope.context.loadPromise.then(onGetContainer);

    function onGetContainer(container) {
      ctrl.container = container.data;
      if (ctrl.container.status !== "Creating") {
        zun.logsContainer(ctrl.container.id).then(onGetLogs);
      }
    }

    function onGetLogs(logs) {
      ctrl.logs = logs.data;
    }
  }
})();
