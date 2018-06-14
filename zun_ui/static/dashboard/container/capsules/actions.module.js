/**
 * Licensed under the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may obtain
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
   * @ngdoc overview
   * @ngname horizon.dashboard.container.capsules.actions
   *
   * @description
   * Provides all of the actions for capsules.
   */
  angular.module('horizon.dashboard.container.capsules.actions',
    [
      'horizon.framework',
      'horizon.dashboard.container'
    ])
    .run(registerCapsuleActions);

  registerCapsuleActions.$inject = [
    'horizon.framework.conf.resource-type-registry.service',
    'horizon.framework.util.i18n.gettext',
    'horizon.dashboard.container.capsules.actions.create.service',
    'horizon.dashboard.container.capsules.actions.delete.service',
    'horizon.dashboard.container.capsules.actions.refresh.service',
    'horizon.dashboard.container.capsules.resourceType'
  ];

  function registerCapsuleActions(
    registry,
    gettext,
    createCapsuleService,
    deleteCapsuleService,
    refreshCapsuleService,
    resourceType
  ) {
    var capsulesResourceType = registry.getResourceType(resourceType);

    capsulesResourceType.globalActions
      .append({
        id: 'createCapsuleAction',
        service: createCapsuleService,
        template: {
          text: gettext('Create')
        }
      });

    capsulesResourceType.batchActions
      .append({
        id: 'deleteCapsuleAction',
        service: deleteCapsuleService,
        template: {
          type: 'delete-selected',
          text: gettext('Delete')
        }
      });

    capsulesResourceType.itemActions
      .append({
        id: 'refreshCapsuleAction',
        service: refreshCapsuleService,
        template: {
          text: gettext('Refresh')
        }
      })
      .append({
        id: 'deleteCapsuleAction',
        service: deleteCapsuleService,
        template: {
          type: 'delete',
          text: gettext('Delete')
        }
      });
  }

})();
