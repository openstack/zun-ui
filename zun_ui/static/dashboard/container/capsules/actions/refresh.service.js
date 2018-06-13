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
   * @name horizon.dashboard.container.capsules.refresh.service
   * @Description
   * refresh container.
   */
  angular
    .module('horizon.dashboard.container.capsules.actions')
    .factory('horizon.dashboard.container.capsules.actions.refresh.service', refreshService);

  refreshService.$inject = [
    'horizon.app.core.openstack-service-api.zun',
    'horizon.dashboard.container.capsules.resourceType',
    'horizon.framework.util.actions.action-result.service',
    'horizon.framework.util.q.extensions'
  ];

  function refreshService(
    zun, resourceType, actionResult, $qExtensions
  ) {

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

    function allowed() {
      return $qExtensions.booleanAsPromise(true);
    }

    function perform(selected) {
      // refresh selected capsule
      return $qExtensions.booleanAsPromise(true).then(success);

      function success() {
        var result = actionResult.getActionResult().updated(resourceType, selected.id);
        return result.result;
      }
    }
  }
})();
