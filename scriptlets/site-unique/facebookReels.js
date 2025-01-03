function facebookReels(source, args) {
  function facebookReels(source) {
    var e = new MutationObserver(function () {
        document.querySelectorAll('[id^="substream"] > div:not(.hidden_elem) div[id^="hyperfeed_story_id"]').forEach(function (e) {
          function t(e, t) {
            for (s = e.querySelectorAll('.userContentWrapper h5 + div[data-testid*="sub"] a [class] [class]'), socheck = 0; socheck < s.length; socheck++)
              s[socheck].innerText.contains(t) && ((c = ['1']), (d = ['1']), (i = ['1']), (r = l = a = 1), (socheck = s.length));
          }

          function o(e, t, o, n, a) {
            (s = e.querySelectorAll('.userContentWrapper h5 + div[data-testid*="sub"] a [data-content=' + t + ']')),
              (c = e.querySelectorAll('.userContentWrapper h5 + div[data-testid*="sub"] a [data-content=' + o + ']')),
              (d = e.querySelectorAll('.userContentWrapper h5 + div[data-testid*="sub"] a [data-content=' + n + ']')),
              (i = e.querySelectorAll('.userContentWrapper h5 + div[data-testid*="sub"] a [data-content=' + a + ']')),
              0 == s.length &&
                ((s = e.querySelectorAll('.userContentWrapper h5 + div[data-testid*="label"] a [data-content=' + t + ']')),
                (c = e.querySelectorAll('.userContentWrapper h5 + div[data-testid*="label"] a [data-content=' + o + ']')),
                (d = e.querySelectorAll('.userContentWrapper h5 + div[data-testid*="label"] a [data-content=' + n + ']')),
                (i = e.querySelectorAll('.userContentWrapper h5 + div[data-testid*="label"] a [data-content=' + a + ']')));
          }
          var n = 0,
            a = 0,
            l = 0,
            r = 0,
            s = 0,
            c = 0,
            d = 0,
            i = 0,
            u = e.querySelectorAll("div[style='width: 100%'] > a[href*='oculus.com/quest'] > div"),
            h = document.querySelector('[lang]').lang,
            g = e.querySelectorAll('a[ajaxify*="ad_id"] > span'),
            p = e.querySelectorAll('a[href*="ads/about"]');
          if ('display: none !important;' != e.getAttribute('style') && !e.classList.contains('hidden_elem')) {
            if (0 < g.length || 0 < p.length) {
              f += 1;
              var y = e.querySelectorAll('a[href]')[2].innerText;
              e.style = 'display:none!important;';
            } else if (0 < u.length) {
              f += 1;
              y = 'Facebook';
              e.style = 'display:none!important;';
            } else
              'af' == h
                ? t(e, 'Geborg')
                : 'de' == h || 'nl' == h
                  ? o(e, 'G', 'e', 's', 'n')
                  : 'am' == h
                    ? t(e, 'የተከፈለበት ማስታወቂያ')
                    : 'ar' == h
                      ? t(e, 'مُموَّل')
                      : 'as' == h
                        ? t(e, 'পৃষ্ঠপোষকতা কৰা')
                        : 'az' == h
                          ? t(e, 'Sponsor dəstəkli')
                          : 'co' == h
                            ? t(e, 'Spunsurizatu')
                            : 'bs' == h || 'sl' == h || 'cs' == h
                              ? o(e, 'S', 'p', 'z', 'n')
                              : 'da' == h ||
                                  'en' == h ||
                                  'et' == h ||
                                  'fy' == h ||
                                  'it' == h ||
                                  'ku' == h ||
                                  'nb' == h ||
                                  'nn' == h ||
                                  'pl' == h ||
                                  'sq' == h ||
                                  'sv' == h ||
                                  'zz' == h
                                ? document.querySelector('body').className.includes('Locale_en_UD')
                                  ? t(e, 'pəɹosuodS')
                                  : o(e, 'S', 'p', 's', 'n')
                                : 'be' == h
                                  ? t(e, 'Рэклама')
                                  : 'bg' == h
                                    ? t(e, 'Спонсорирано')
                                    : 'mk' == h
                                      ? t(e, 'Спонзорирано')
                                      : 'br' == h
                                        ? t(e, 'Paeroniet')
                                        : 'ca' == h
                                          ? t(e, 'Patrocinat')
                                          : 'gl' == h || 'pt' == h
                                            ? t(e, 'Patrocinado')
                                            : 'bn' == h
                                              ? t(e, 'সৌজন্যে')
                                              : 'cb' == h
                                                ? t(e, 'پاڵپشتیکراو')
                                                : 'cx' == h
                                                  ? o(e, 'G', 'i', 's', 'n')
                                                  : 'cy' == h
                                                    ? t(e, 'Noddwyd')
                                                    : 'el' == h
                                                      ? t(e, 'Χορηγούμενη')
                                                      : 'eo' == h
                                                        ? t(e, 'Reklamo')
                                                        : 'es' == h
                                                          ? o(e, 'P', 'u', 'c', 'd')
                                                          : 'eu' == h
                                                            ? t(e, 'Babestua')
                                                            : 'fa' == h
                                                              ? t(e, 'دارای پشتیبانی مالی')
                                                              : 'ff' == h
                                                                ? t(e, 'Yoɓanaama')
                                                                : 'fi' == h
                                                                  ? t(e, 'Sponsoroitu')
                                                                  : 'fo' == h
                                                                    ? t(e, 'Stuðlað')
                                                                    : 'fr' == h
                                                                      ? document.querySelector('body').className.includes('Locale_fr_FR')
                                                                        ? o(e, 'S', 'p', 's', 'n')
                                                                        : o(e, 'C', 'o', 'm', 'n')
                                                                      : 'ga' == h
                                                                        ? t(e, 'Urraithe')
                                                                        : 'gn' == h
                                                                          ? t(e, 'Oñepatrosinapyre')
                                                                          : 'gu' == h
                                                                            ? t(e, 'પ્રાયોજિત')
                                                                            : 'ha' == h
                                                                              ? t(e, 'Daukar Nauyi')
                                                                              : 'he' == h
                                                                                ? t(e, 'ממומן')
                                                                                : 'hr' == h
                                                                                  ? t(e, 'Plaćeni oglas')
                                                                                  : 'ht' == h
                                                                                    ? t(e, 'Peye')
                                                                                    : 'ne' == h || 'mr' == h || 'hi' == h
                                                                                      ? t(e, 'प्रायोजित')
                                                                                      : 'hu' == h
                                                                                        ? o(e, 'H', 'i', 'r', 'd')
                                                                                        : 'hy' == h
                                                                                          ? t(e, 'Գովազդային')
                                                                                          : 'id' == h
                                                                                            ? o(e, 'B', 'e', 'p', 'n')
                                                                                            : 'is' == h
                                                                                              ? t(e, 'Kostað')
                                                                                              : 'ja' == h
                                                                                                ? t(e, '広告')
                                                                                                : 'ms' == h
                                                                                                  ? t(e, 'Ditaja')
                                                                                                  : 'jv' == h
                                                                                                    ? t(e, 'Disponsori')
                                                                                                    : 'ka' == h
                                                                                                      ? t(e, 'რეკლამა')
                                                                                                      : 'kk' == h
                                                                                                        ? t(e, 'Демеушілік көрсеткен')
                                                                                                        : 'km' == h
                                                                                                          ? t(e, 'បានឧបត្ថម្ភ')
                                                                                                          : 'kn' == h
                                                                                                            ? t(e, 'ಪ್ರಾಯೋಜಿತ')
                                                                                                            : 'ko' == h
                                                                                                              ? t(e, 'Sponsored')
                                                                                                              : 'ky' == h
                                                                                                                ? t(e, 'Демөөрчүлөнгөн')
                                                                                                                : 'lo' == h
                                                                                                                  ? t(e, 'ຜູ້ສະໜັບສະໜູນ')
                                                                                                                  : 'lt' == h
                                                                                                                    ? t(e, 'Remiama')
                                                                                                                    : 'lv' == h
                                                                                                                      ? t(e, 'Apmaksāta reklāma')
                                                                                                                      : 'mg' == h
                                                                                                                        ? t(e, 'Misy Mpiantoka')
                                                                                                                        : 'ml' == h
                                                                                                                          ? t(e, 'സ്പോൺസർ ചെയ്തത്')
                                                                                                                          : 'mn' == h
                                                                                                                            ? t(e, 'Ивээн тэтгэсэн')
                                                                                                                            : 'mt' == h
                                                                                                                              ? t(e, 'Sponsorjat')
                                                                                                                              : 'my' == h
                                                                                                                                ? t(e, 'ပံ့ပိုးထားသည်')
                                                                                                                                : 'or' == h
                                                                                                                                  ? t(e, 'ପ୍ରଯୋଜିତ')
                                                                                                                                  : 'pa' == h
                                                                                                                                    ? t(e, 'ਸਰਪ੍ਰਸਤੀ ਪ੍ਰਾਪਤ')
                                                                                                                                    : 'ps' == h
                                                                                                                                      ? t(e, 'تمويل شوي')
                                                                                                                                      : 'ro' == h
                                                                                                                                        ? t(e, 'Sponsorizat')
                                                                                                                                        : 'ru' == h || 'uk' == h
                                                                                                                                          ? t(e, 'Реклама')
                                                                                                                                          : 'rw' == h
                                                                                                                                            ? t(
                                                                                                                                                e,
                                                                                                                                                'Icyamamaza ndasukirwaho',
                                                                                                                                              )
                                                                                                                                            : 'sc' == h
                                                                                                                                              ? t(
                                                                                                                                                  e,
                                                                                                                                                  'Patronadu de',
                                                                                                                                                )
                                                                                                                                              : 'si' == h
                                                                                                                                                ? t(
                                                                                                                                                    e,
                                                                                                                                                    'අනුග්‍රාහක',
                                                                                                                                                  )
                                                                                                                                                : 'sk' == h
                                                                                                                                                  ? t(
                                                                                                                                                      e,
                                                                                                                                                      'Sponzorované',
                                                                                                                                                    )
                                                                                                                                                  : 'sn' == h
                                                                                                                                                    ? t(
                                                                                                                                                        e,
                                                                                                                                                        'Zvabhadharirwa',
                                                                                                                                                      )
                                                                                                                                                    : 'so' == h
                                                                                                                                                      ? t(
                                                                                                                                                          e,
                                                                                                                                                          'La maalgeliyey',
                                                                                                                                                        )
                                                                                                                                                      : 'sr' ==
                                                                                                                                                          h
                                                                                                                                                        ? t(
                                                                                                                                                            e,
                                                                                                                                                            'Спонзорисано',
                                                                                                                                                          )
                                                                                                                                                        : 'sw' ==
                                                                                                                                                            h
                                                                                                                                                          ? t(
                                                                                                                                                              e,
                                                                                                                                                              'Imedhaminiwa',
                                                                                                                                                            )
                                                                                                                                                          : 'sy' ==
                                                                                                                                                              h
                                                                                                                                                            ? t(
                                                                                                                                                                e,
                                                                                                                                                                'ܒܘܕܩܐ ܡܡܘܘܢܐ',
                                                                                                                                                              )
                                                                                                                                                            : 'sz' ==
                                                                                                                                                                h
                                                                                                                                                              ? t(
                                                                                                                                                                  e,
                                                                                                                                                                  'Szpōnzorowane',
                                                                                                                                                                )
                                                                                                                                                              : 'ta' ==
                                                                                                                                                                  h
                                                                                                                                                                ? t(
                                                                                                                                                                    e,
                                                                                                                                                                    'விளம்பரம்',
                                                                                                                                                                  )
                                                                                                                                                                : 'te' ==
                                                                                                                                                                    h
                                                                                                                                                                  ? t(
                                                                                                                                                                      e,
                                                                                                                                                                      'ప్రాయోజితం చేయబడింది',
                                                                                                                                                                    )
                                                                                                                                                                  : 'tg' ==
                                                                                                                                                                      h
                                                                                                                                                                    ? t(
                                                                                                                                                                        e,
                                                                                                                                                                        'Бо сарпарастӣ',
                                                                                                                                                                      )
                                                                                                                                                                    : 'th' ==
                                                                                                                                                                        h
                                                                                                                                                                      ? t(
                                                                                                                                                                          e,
                                                                                                                                                                          'ได้รับการสนับสนุน',
                                                                                                                                                                        )
                                                                                                                                                                      : 'tl' ==
                                                                                                                                                                          h
                                                                                                                                                                        ? t(
                                                                                                                                                                            e,
                                                                                                                                                                            'May Sponsor',
                                                                                                                                                                          )
                                                                                                                                                                        : 'tr' ==
                                                                                                                                                                            h
                                                                                                                                                                          ? t(
                                                                                                                                                                              e,
                                                                                                                                                                              'Sponsorlu',
                                                                                                                                                                            )
                                                                                                                                                                          : 'tt' ==
                                                                                                                                                                              h
                                                                                                                                                                            ? t(
                                                                                                                                                                                e,
                                                                                                                                                                                'Хәйрияче',
                                                                                                                                                                              )
                                                                                                                                                                            : 'tz' ==
                                                                                                                                                                                h
                                                                                                                                                                              ? t(
                                                                                                                                                                                  e,
                                                                                                                                                                                  'ⵉⴷⵍ',
                                                                                                                                                                                )
                                                                                                                                                                              : 'ur' ==
                                                                                                                                                                                  h
                                                                                                                                                                                ? t(
                                                                                                                                                                                    e,
                                                                                                                                                                                    'سپانسرڈ',
                                                                                                                                                                                  )
                                                                                                                                                                                : 'uz' ==
                                                                                                                                                                                    h
                                                                                                                                                                                  ? t(
                                                                                                                                                                                      e,
                                                                                                                                                                                      'Reklama',
                                                                                                                                                                                    )
                                                                                                                                                                                  : 'vi' ==
                                                                                                                                                                                      h
                                                                                                                                                                                    ? t(
                                                                                                                                                                                        e,
                                                                                                                                                                                        'Được tài trợ',
                                                                                                                                                                                      )
                                                                                                                                                                                    : 'zh-Hans' ==
                                                                                                                                                                                        h
                                                                                                                                                                                      ? t(
                                                                                                                                                                                          e,
                                                                                                                                                                                          '赞助内容',
                                                                                                                                                                                        )
                                                                                                                                                                                      : 'zh-Hant' ==
                                                                                                                                                                                          h &&
                                                                                                                                                                                        t(
                                                                                                                                                                                          e,
                                                                                                                                                                                          '贊助',
                                                                                                                                                                                        );
            if (0 < s.length && 0 < c.length && 0 < d.length && 0 < i.length) {
              for (cont = 0; cont < s.length; cont++) 0 < s[cont].offsetHeight && ((cont = s.length), (n = 1));
              for (cont1 = 0; cont1 < c.length; cont1++) 0 < c[cont1].offsetHeight && ((cont1 = c.length), (a = 1));
              for (cont2 = 0; cont2 < d.length; cont2++) 0 < d[cont2].offsetHeight && ((cont2 = d.length), (l = 1));
              for (cont3 = 0; cont3 < i.length; cont3++) 0 < i[cont3].offsetHeight && ((cont3 = i.length), (r = 1));
              if (1 == n && 1 == a && 1 == l && 1 == r) {
                y = e.querySelectorAll('a[href]')[2].innerText;
                (f += 1), (e.style = 'display:none!important;');
              }
            }
          }
        });
      }),
      f = 0;
    e.observe(document, {
      childList: !0,
      subtree: !0,
      characterData: !0,
      attributes: !0,
    });
  }
  const updatedArgs = args ? [].concat(source).concat(args) : [source];
  if (!window._pisources) {
    window._pisources = {};
  }
  if (window._pisources[source.name]) {
    if (window._pisources[source.name].includes(JSON.stringify(args))) {
      return;
    }
  } else {
    window._pisources[source.name] = [];
  }
  window._pisources[source.name].push(JSON.stringify(args));
  try {
    facebookReels.apply(this, updatedArgs);
  } catch (e) {
    console.log(e);
  }
}

export default facebookReels;
