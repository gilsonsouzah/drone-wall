"use strict";

module.exports = [ "$rootScope",

    function ( $rootScope )
    {
        var builds = [];
        var buildCapacity = 30;

        var findBuild = function ( commit )
        {
            console.log('Build length inside Builds js', builds.length);
            for( var i = 0; i < builds.length; i++ )
            {
                if( builds[ i ].id === commit )
                {
                    console.log('Find Build', builds[i]);
                    return builds[ i ];
                }
            }

            return null;
        };

        var addBuild = function ( build, developer )
        {
            builds.push( angular.extend( build, { developer: developer } ) );
            $rootScope.$broadcast( "newBuild", build );

            return build;
        };

        var parseBuild = function ( build, developer )
        {

            console.log('Bulid Recevied on Build JS',build);

            console.log('Bulid Status',build.status);

            var currentBuild = findBuild(build.repo_id) || addBuild( build, developer );

            currentBuild.startedAt  = build.started;
            currentBuild.finishedAt = build.finished;
            currentBuild.updatedAt  = build.updated;
            currentBuild.status     = build.status;

            console.log('Current Build status',currentBuild.status);

            if( currentBuild.status === "success" )
            {
                $rootScope.$broadcast( "buildSuccess", currentBuild );
            }
            else if( currentBuild.status === "failure" || currentBuild.status === "error" ||
                currentBuild.status === "killed" )
            {
                $rootScope.$broadcast( "buildFailure", currentBuild );
            }

            if( builds.length > buildCapacity )
            {
                builds.shift();
            }
            console.log('Parse Build', builds);
        };

        return {
            parseBuild:  parseBuild,
            getBuilds:   () => builds,
            resetBuilds: () => builds = []
        };

    }

];
