define([
    'angular',
    'underscore'
], function (angular, _) {
    return angular.module('underscore', [])
                  .value('_', _);
});
