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
   * @ngdoc controller
   * @name horizon.dashboard.container.capsules.actions.workflow.loadTemplateController
   * @ngController
   *
   * @description
   * Controller for the loading template file
   */
  angular
    .module('horizon.dashboard.container.capsules.actions')
    .controller('horizon.dashboard.container.capsules.actions.workflow.loadTemplateController',
      loadTemplateController);

  loadTemplateController.$inject = [
    '$scope'
  ];

  function loadTemplateController($scope) {
    var ctrl = this;
    ctrl.title = $scope.schema.properties.template.title;
    ctrl.template = "";
    ctrl.onTemplateChange = onTemplateChange;

    ////

    function onTemplateChange(template) {
      $scope.model.template = template;
    }
  }
})();
