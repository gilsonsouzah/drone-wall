"use strict";

const drone = require('drone-node');

module.exports = [ "$q", "$filter", "API", "Settings",

    function ( $q, $filter, API, Settings )
    {
        var filters;
        var path = Settings.apiRoot;
        path = path.substr( -1, 1 ) === "/" || path === "" ? path : path + "/";

        var apiInterface = new API( {
            rootPath: path,
            unauthorizedInterrupt: false
        } );

        apiInterface.setKey( Settings.token );

        apiInterface.parseFilters = function ()
        {
            filters = {
                include: Settings.include ? Settings.include.replace( /\s/g, "" ).split( "," ) : [],
                exclude: Settings.exclude ? Settings.exclude.replace( /\s/g, "" ).split( "," ) : []
            };
        };
        apiInterface.parseFilters();

        var filterBuilds = function ( builds, filterSet, filterType )
        {
            return $filter( "filter" )( builds, function ( build )
            {
                for( var i = 0; i < filterSet.length; i++ )
                {
                    var parts = filterSet[ i ].split( "/" );

                    if( parts.length === 2 )
                    {
                        // Match branches
                        if( ( parts[ 0 ] === "*" || parts[ 0 ] === build.name ) && parts[ 1 ] === build.branch )
                        {
                            return filterType;
                        }
                    }
                    else
                    {
                        // Match repos
                        if( parts[ 0 ] === build.name )
                        {
                            return filterType;
                        }
                    }
                }

                return !filterType;
            } );
        };

        apiInterface.getLatest = function ()
        {
            var deferred = $q.defer();


            var client = new drone.Client({
                 url: path,
                 token: Settings.token
                });

            client.recentBuilds().then( function ( response )
            {
                var builds = response;

                console.log(builds);

                console.log('Type', angular.isArray( builds ));
                if( angular.isArray( builds ) )
                {
                    if( filters.include.length )
                    {
                        builds = filterBuilds( builds, filters.include, true );
                    }
                    if( filters.exclude.length )
                    {
                        builds = filterBuilds( builds, filters.exclude, false );
                    }
                }

                response = builds;

                console.log(response);

                deferred.resolve( response );
            },
            function ( response )
            {
                deferred.reject( response );
            } );

            return deferred.promise;
        };

        return apiInterface;
    }

];
