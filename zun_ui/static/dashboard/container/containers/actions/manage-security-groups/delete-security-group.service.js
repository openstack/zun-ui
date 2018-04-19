/*
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

  /**
   * @ngdoc overview
   * @name horizon.dashboard.container.containers.manage-security-groups.delete.service
   * @description Service for the security group deletion for manage-security-groups modal
   */
  angular
    .module('horizon.dashboard.container.containers')
    .constant('horizon.dashboard.container.containers.manage-security-groups.delete.events',
      events())
    .factory('horizon.dashboard.container.containers.manage-security-groups.delete.service',
      service);

  function events() {
    return {
      DELETE_SUCCESS: 'horizon.dashboard.container.containers.manage-security-groups.DELETE_SUCCESS'
    };
  }

  service.$inject = [
    'horizon.framework.util.q.extensions',
    'horizon.dashboard.container.containers.manage-security-groups.delete.events'
  ];

  function service(
    $qExtensions,
    events
  ) {
    var service = {
      allowed: allowed,
      perform: perform
    };

    return service;

    function allowed() {
      return $qExtensions.booleanAsPromise(true);
    }

    function perform(selected, scope) {
      scope.$emit(events.DELETE_SUCCESS, selected);
      return $qExtensions.booleanAsPromise(true);
    }
  }
})();
