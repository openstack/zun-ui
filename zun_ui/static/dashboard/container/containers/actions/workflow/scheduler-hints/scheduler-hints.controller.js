/*
 * Copyright 2016 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
(function() {
  'use strict';

  /**
   * @ngdoc controller
   * @name horizon.dashboard.container.containers.workflow.scheduler-hints
   * @description
   * The `SchedulerHintsController` controller provides functions for
   * configuring the scheduler hints step of the Create Container Workflow.
   */
  angular
    .module('horizon.dashboard.container.containers')
    .controller('horizon.dashboard.container.containers.workflow.scheduler-hints',
      SchedulerHintsController);

  SchedulerHintsController.$inject = [
    '$scope',
    'horizon.framework.util.i18n.gettext'
  ];

  function SchedulerHintsController($scope, gettext) {
    var ctrl = this;
    ctrl.availableHints = $scope.model.availableHints;
    ctrl.hintsTree = $scope.model.hintsTree;

    ctrl.text = {
      /* eslint-disable max-len */
      help: gettext('You can specify scheduler hints by moving items from the left column to the right column. Use the "Custom" option to add scheduler hints with the key of your choice.'),
      /* eslint-enable max-len */
      available: gettext('Available Scheduler Hints'),
      existing: gettext('Existing Scheduler Hints'),
      noAvailable: gettext('No available scheduler hints'),
      noExisting: gettext('No existing scheduler hints')
    };
  }

})();
