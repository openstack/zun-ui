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
   * @ngname horizon.dashboard.container.images.actions
   *
   * @description
   * Provides all of the actions for images.
   */
  angular.module('horizon.dashboard.container.images.actions',
    [
      'horizon.framework',
      'horizon.dashboard.container'
    ])
    .run(registerImageActions);

  registerImageActions.$inject = [
    'horizon.framework.conf.resource-type-registry.service',
    'horizon.framework.util.i18n.gettext',
    'horizon.dashboard.container.images.actions.create.service',
    'horizon.dashboard.container.images.actions.delete.service',
    'horizon.dashboard.container.images.resourceType'
  ];

  function registerImageActions(
    registry,
    gettext,
    createImageService,
    deleteImageService,
    resourceType
  ) {
    var imagesResourceType = registry.getResourceType(resourceType);

    imagesResourceType.globalActions
      .append({
        id: 'createImageAction',
        service: createImageService,
        template: {
          type: 'create',
          text: gettext('Pull Image')
        }
      });

    imagesResourceType.batchActions
      .append({
        id: 'deleteImageAction',
        service: deleteImageService,
        template: {
          type: 'delete-selected',
          text: gettext('Delete Images')
        }
      });

    imagesResourceType.itemActions
      .append({
        id: 'deleteImageAction',
        service: deleteImageService,
        template: {
          text: gettext('Delete Image')
        }
      });
  }

})();
