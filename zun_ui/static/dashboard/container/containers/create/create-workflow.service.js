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

  angular
    .module('horizon.dashboard.container.containers')
    .factory('horizon.dashboard.container.containers.workflow', containerWorkflow);

  containerWorkflow.$inject = [
    'horizon.dashboard.container.basePath',
    'horizon.app.core.workflow.factory',
    'horizon.framework.util.i18n.gettext'
  ];

  function containerWorkflow(basePath, dashboardWorkflow, gettext) {
    return dashboardWorkflow({
      title: gettext('Create Container'),

      steps: [
        {
          title: gettext('Info'),
          templateUrl: basePath + 'containers/create/info/info.html',
          helpUrl: basePath + 'containers/create/info/info.help.html',
          formName: 'containerInfoForm'
        }
      ],

      btnText: {
        finish: gettext('Create')
      },

      btnIcon: {
        finish: 'fa fa-check'
      }
    });
  }
})();
