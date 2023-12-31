(function ($) {
  $.fn.textAnimation = function (options) {
    var settings = $.extend(
      {
        animationDelay: 2500,
        barAnimationDelay: 3800,
        barWaiting: 800,
        lettersDelay: 50,
        typeLettersDelay: 150,
        selectionDuration: 500,
        typeAnimationDelay: 800,
        revealDuration: 600,
        revealAnimationDelay: 1500,
        stopAnimation: false,
      },
      options
    );

    function singleLetters($words) {
      $words.each(function () {
        var word = $(this),
          letters = word.text().split(""),
          selected = word.hasClass("is-visible");
        for (i in letters) {
          if (word.parents(".rotate-2").length > 0)
            letters[i] = "<em>" + letters[i] + "</em>";
          letters[i] = selected
            ? '<i class="in">' + letters[i] + "</i>"
            : "<i>" + letters[i] + "</i>";
        }
        var newLetters = letters.join("");
        word.html(newLetters);
      });
    }

    function animateHeadline($headlines) {
      var duration = settings.animationDelay;
      $headlines.each(function () {
        var headline = $(this);

        if (headline.hasClass("loading-bar")) {
          duration = settings.barAnimationDelay;
          setTimeout(function () {
            headline.find(".cd-words-wrapper").addClass("is-loading");
          }, settings.barWaiting);
        } else if (headline.hasClass("clip")) {
          var spanWrapper = headline.find(".cd-words-wrapper"),
            newWidth = spanWrapper.width() + 10;
          spanWrapper.css("width", newWidth);
        } else if (!headline.hasClass("type")) {
          var words = headline.find(".cd-words-wrapper b"),
            width = 0;
          words.each(function () {
            var wordWidth = $(this).width();
            if (wordWidth > width) width = wordWidth;
          });
          headline.find(".cd-words-wrapper").css("width", width);
        }

        setTimeout(function () {
          hideWord(headline.find(".is-visible").eq(0));
        }, duration);
      });
    }

    function hideWord($word) {
      var nextWord = takeNext($word);

      if (settings.stopAnimation) {
        return false;
      }

      if ($word.parents(".cd-headline").hasClass("type")) {
        var parentSpan = $word.parent(".cd-words-wrapper");
        parentSpan.addClass("selected").removeClass("waiting");
        setTimeout(function () {
          parentSpan.removeClass("selected");
          $word
            .removeClass("is-visible")
            .addClass("is-hidden")
            .children("i")
            .removeClass("in")
            .addClass("out");
        }, settings.selectionDuration);
        setTimeout(function () {
          showWord(nextWord, settings.typeLettersDelay);
        }, settings.typeAnimationDelay);
      } else if ($word.parents(".cd-headline").hasClass("letters")) {
        var bool =
          $word.children("i").length >= nextWord.children("i").length
            ? true
            : false;
        hideLetter($word.find("i").eq(0), $word, bool, settings.lettersDelay);
        showLetter(
          nextWord.find("i").eq(0),
          nextWord,
          bool,
          settings.lettersDelay
        );
      } else if ($word.parents(".cd-headline").hasClass("clip")) {
        $word
          .parents(".cd-words-wrapper")
          .animate({ width: "2px" }, settings.revealDuration, function () {
            switchWord($word, nextWord);
            showWord(nextWord);
          });
      } else if ($word.parents(".cd-headline").hasClass("loading-bar")) {
        $word.parents(".cd-words-wrapper").removeClass("is-loading");
        switchWord($word, nextWord);
        setTimeout(function () {
          hideWord(nextWord);
        }, settings.barAnimationDelay);
        setTimeout(function () {
          $word.parents(".cd-words-wrapper").addClass("is-loading");
        }, settings.barWaiting);
      } else {
        switchWord($word, nextWord);
        setTimeout(function () {
          hideWord(nextWord);
        }, settings.animationDelay);
      }
    }

    function showWord($word, $duration) {
      if ($word.parents(".cd-headline").hasClass("type")) {
        showLetter($word.find("i").eq(0), $word, false, $duration);
        $word.addClass("is-visible").removeClass("is-hidden");
      } else if ($word.parents(".cd-headline").hasClass("clip")) {
        $word
          .parents(".cd-words-wrapper")
          .animate(
            { width: $word.width() + 10 },
            settings.revealDuration,
            function () {
              setTimeout(function () {
                hideWord($word);
              }, settings.revealAnimationDelay);
            }
          );
      }
    }

    function hideLetter($letter, $word, $bool, $duration) {
      $letter.removeClass("in").addClass("out");

      if (!$letter.is(":last-child")) {
        setTimeout(function () {
          hideLetter($letter.next(), $word, $bool, $duration);
        }, $duration);
      } else if ($bool) {
        setTimeout(function () {
          hideWord(takeNext($word));
        }, settings.animationDelay);
      }

      if (
        $letter.is(":last-child") &&
        $("html").hasClass("no-csstransitions")
      ) {
        var nextWord = takeNext($word);
        switchWord($word, nextWord);
      }
    }

    function showLetter($letter, $word, $bool, $duration) {
      $letter.addClass("in").removeClass("out");

      if (!$letter.is(":last-child")) {
        setTimeout(function () {
          showLetter($letter.next(), $word, $bool, $duration);
        }, $duration);
      } else {
        if ($word.parents(".cd-headline").hasClass("type")) {
          setTimeout(function () {
            $word.parents(".cd-words-wrapper").addClass("waiting");
          }, 200);
        }
        if (!$bool) {
          setTimeout(function () {
            hideWord($word);
          }, settings.animationDelay);
        }
      }
    }

    function takeNext($word) {
      return !$word.is(":last-child")
        ? $word.next()
        : $word.parent().children().eq(0);
    }

    function takePrev($word) {
      return !$word.is(":first-child")
        ? $word.prev()
        : $word.parent().children().last();
    }

    function switchWord($oldWord, $newWord) {
      $oldWord.removeClass("is-visible").addClass("is-hidden");
      $newWord.removeClass("is-hidden").addClass("is-visible");
    }

    var icon = $("#player");
    icon.click(function () {
      if (icon.hasClass("on")) {
        icon
          .removeClass("on icon-pause-circle-fill")
          .addClass("off icon-play-circle-fill");
        settings.stopAnimation = true;
      } else {
        icon
          .removeClass("off icon-play-circle-fill")
          .addClass("on icon-pause-circle-fill");
        settings.stopAnimation = false;
        settings.animationDelay = 1000;
        animateHeadline($(".cd-headline"));
      }
      return false;
    });

    return this.each(function () {
      var headline = $(this);
      animateHeadline(headline);
    });
  };
})(jQuery);
