/**
 * Licensed under the Apache License, Version 2.0 (the "License"); you may
 * not use self file except in compliance with the License. You may obtain
 * a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */

(function() {
  'use strict';

  /**
   * @ngDoc factory
   * @name horizon.dashboard.container.containers.unpause.service
   * @Description
   * unpause container.
   */
  angular
    .module('horizon.dashboard.container.containers')
    .factory('horizon.dashboard.container.containers.unpause.service', unpauseService);

  unpauseService.$inject = [
    'horizon.app.core.openstack-service-api.zun',
    'horizon.dashboard.container.containers.resourceType',
    'horizon.dashboard.container.containers.validStates',
    'horizon.framework.util.actions.action-result.service',
    'horizon.framework.util.q.extensions',
    'horizon.framework.widgets.toast.service'
  ];

  function unpauseService(
    zun, resourceType, validStates, actionResult, $qExtensions, toast
  ) {

    var message = {
      success: gettext('Container %s was successfully unpaused.')
    };

    var service = {
      initAction: initAction,
      allowed: allowed,
      perform: perform
    };

    return service;

    //////////////

    // include this function in your service
    // if you plan to emit events to the parent controller
    function initAction() {
    }

    function allowed(container) {
      return $qExtensions.booleanAsPromise(
        validStates.unpause.indexOf(container.status) >= 0
      );
    }

    function perform(selected) {
      // unpause selected container
      return zun.unpauseContainer(selected.id).then(success);

      function success() {
        toast.add('success', interpolate(message.success, [selected.name]));
        var result = actionResult.getActionResult().updated(resourceType, selected.id);
        return result.result;
      }
    }
  }
})();
