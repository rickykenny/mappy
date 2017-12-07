angular.module('app')
    .factory('dictionaryService', [function () {
        var phrases = {
            findingLocation: [
                'Working out where you are...',
                'Working out where the fuck you are...'
            ],
            locationDenied: [
                'You denied your location :(',
                'You denied your fucking location!'
            ],
            locationDeniedLong: [
                "If you didn't deny your location, your security settings are probably just too tight and your device is blocking your location automatically. Change your settings and try again...",
                "If you think that's bullshit, your security settings are probably too tight and your device is blocking your location automatically. Remove your tinfoil hat and try again..."
            ]
        }
        
        this.getPhrase = function (phraseId, dirty) {
            phrase = phrases[phraseId];
            if(!phrase){
                throw new Error('PhraseId ' + phraseId + ' not found')
            }

            if (dirty && phrase[1]) {
                return phrase[1];
            }
            return phrase[0];
        }
        return this;
    }]);