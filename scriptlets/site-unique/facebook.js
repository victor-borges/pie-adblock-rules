function facebook(source, args) {
  function facebook(source) {
    var e = new MutationObserver(function () {
        var m = document.querySelectorAll("div[id^='mount_']");
        {
          var e;
          e =
            0 < m.length
              ? document.querySelectorAll('div[role="feed"] > div[data-pagelet^="FeedUnit"] > div[class]:not([style*="height"])')
              : document.querySelectorAll('[id^="substream"] > div:not(.hidden_elem) div[id^="hyperfeed_story_id"]');
        }
        e.forEach(function (e) {
          function n(e, n) {
            for (
              0 < m.length
                ? '0' == (h = e.querySelectorAll('div[role="article"] span[dir="auto"] > a > span > span > span[data-content]')).length &&
                  (h = e.querySelectorAll('div[role="article"] span[dir="auto"] > a > span[aria-label]'))
                : (h = e.querySelectorAll('.userContentWrapper h5 + div[data-testid] a [class] [class]')),
                socheck = 0;
              socheck < h.length;
              socheck++
            )
              h[socheck].innerText.contains(n) && ((p = ['1']), (d = ['1']), (u = ['1']), (i = r = l = 1), (socheck = h.length));
          }

          function t(e, n, t, c, a) {
            for (
              0 < m.length
                ? '0' == (h = e.querySelectorAll('div[role="article"] span[dir="auto"] > a > span > span > span[data-content]')).length &&
                  (h = e.querySelectorAll('div[role="article"] span[dir="auto"] div[role="button"][tabindex]'))
                : (h = e.querySelectorAll('.userContentWrapper h5 + div[data-testid] > span a > [class] [class]')),
                '0' == h.length && (h = e.querySelectorAll('div[role="article"] span[dir="auto"] > a > span[aria-label]')),
                socheck = 0;
              socheck < h.length;
              socheck++
            ) {
              (spancheck = 0),
                1 < h.length
                  ? ((spancheck = h[socheck].querySelectorAll('span')[0]), 0 == spancheck && (spancheck = h[socheck].querySelectorAll('b')[0]))
                  : ((spancheck = h[0].querySelectorAll('span')[socheck]), 0 == spancheck && (spancheck = h[0].querySelectorAll('b')[socheck]));
              var o = h[0];
              if (0 != spancheck && spancheck) {
                if (2 == spancheck.children.length && 0 < m.length)
                  for (spancheck = spancheck.querySelectorAll('span:not([style])'), spcheck = 0; spcheck < spancheck.length; spcheck++)
                    spancheck[spcheck].innerText.contains(n)
                      ? (s = 1)
                      : !spancheck[spcheck].innerText.contains(t) ||
                          0 != spancheck[spcheck].offsetTop ||
                          spancheck[spcheck].innerText.contains(n) ||
                          spancheck[spcheck].innerText.contains(c) ||
                          spancheck[spcheck].innerText.contains(a)
                        ? !spancheck[spcheck].innerText.contains(c) ||
                          0 != spancheck[spcheck].offsetTop ||
                          spancheck[spcheck].innerText.contains(t) ||
                          spancheck[spcheck].innerText.contains(n) ||
                          spancheck[spcheck].innerText.contains(a)
                          ? !spancheck[spcheck].innerText.contains(a) ||
                            0 != spancheck[spcheck].offsetTop ||
                            spancheck[spcheck].innerText.contains(t) ||
                            spancheck[spcheck].innerText.contains(c) ||
                            spancheck[spcheck].innerText.contains(n) ||
                            ((u = ['1']), (i = 1))
                          : ((d = ['1']), (r = 1))
                        : ((p = ['1']), (l = 1));
                0 == m.length &&
                  ((!((spancheck.innerText.contains(n) && 0 == spancheck.offsetTop) || (h[0].innerText.contains(n) && 0 == h[0].offsetTop)) ||
                    (spancheck.innerText.contains(t) && !h[0].innerText.contains(t)) ||
                    (spancheck.innerText.contains(c) && !h[0].innerText.contains(c)) ||
                    (spancheck.innerText.contains(a) && !h[0].innerText.contains(a))) &&
                  (!o.innerText.contains(n) || 0 != o.offsetTop || o.innerText.contains(t) || o.innerText.contains(c) || o.innerText.contains(a))
                    ? !spancheck.innerText.contains(t) ||
                      0 != spancheck.offsetTop ||
                      spancheck.innerText.contains(n) ||
                      spancheck.innerText.contains(c) ||
                      spancheck.innerText.contains(a)
                      ? !spancheck.innerText.contains(c) ||
                        0 != spancheck.offsetTop ||
                        spancheck.innerText.contains(t) ||
                        spancheck.innerText.contains(n) ||
                        spancheck.innerText.contains(a)
                        ? !spancheck.innerText.contains(a) ||
                          0 != spancheck.offsetTop ||
                          spancheck.innerText.contains(t) ||
                          spancheck.innerText.contains(c) ||
                          spancheck.innerText.contains(n) ||
                          ((u = ['1']), (i = 1))
                        : ((d = ['1']), (r = 1))
                      : ((p = ['1']), (l = 1))
                    : (s = 1));
              }
            }
          }

          function c(e, n, t, c, a) {
            u =
              0 < m.length
                ? ((h = e.querySelectorAll('div[role="article"] span[dir="auto"] > a > span span[data-content=' + n + ']')),
                  (p = e.querySelectorAll('div[role="article"] span[dir="auto"] > a > span span[data-content=' + t + ']')),
                  (d = e.querySelectorAll('div[role="article"] span[dir="auto"] > a > span span[data-content=' + c + ']')),
                  e.querySelectorAll('div[role="article"] span[dir="auto"] > a > span span[data-content=' + a + ']'))
                : ((h = e.querySelectorAll('.userContentWrapper h5 + div[data-testid] a [data-content=' + n + ']')),
                  (p = e.querySelectorAll('.userContentWrapper h5 + div[data-testid] a [data-content=' + t + ']')),
                  (d = e.querySelectorAll('.userContentWrapper h5 + div[data-testid] a [data-content=' + c + ']')),
                  e.querySelectorAll('.userContentWrapper h5 + div[data-testid] a [data-content=' + a + ']'));
          }
          var s = 0,
            l = 0,
            r = 0,
            i = 0,
            h = 0,
            p = 0,
            d = 0,
            u = 0,
            a = e.querySelectorAll("div[style='width: 100%'] > a[href*='oculus.com/quest'] > div"),
            o = document.querySelector('[lang]'),
            k = document.querySelectorAll("link[rel='preload'][href*='/l/']");
          o = o ? document.querySelector('[lang]').lang : 'en';
          var y,
            g = e.querySelectorAll('a[ajaxify*="ad_id"] > span'),
            f = e.querySelectorAll('a[href*="ads/about"]'),
            S = e.querySelectorAll('a[href*="https://www.facebook.com/business/help"]');
          if (
            'display: none !important;' != e.getAttribute('style') &&
            !e.classList.contains('hidden_elem') &&
            (0 < g.length || 0 < f.length || 0 < S.length
              ? ((T += 1),
                0 < m.length
                  ? ('' == (y = e.querySelectorAll('a[href]')[0].innerText) && (y = e.querySelectorAll('a[href]')[1].innerText),
                    '' == y && (y = e.querySelectorAll('a[href]')[0].querySelectorAll('a[aria-label]')[0].getAttribute('aria-label')))
                  : (y = e.querySelectorAll('a[href]')[2].innerText),
                (e.style = 'display:none!important;'))
              : 0 < a.length
                ? ((T += 1), (y = 'Facebook'), (e.style = 'display:none!important;'))
                : 'af' == o
                  ? n(e, 'Geborg')
                  : 'de' == o || 'nl' == o
                    ? c(e, 'G', 'e', 's', 'n')
                    : 'am' == o
                      ? n(e, 'የተከፈለበት ማስታወቂያ')
                      : 'ar' == o
                        ? n(e, 'مُموَّل')
                        : 'as' == o
                          ? n(e, 'পৃষ্ঠপোষকতা কৰা')
                          : 'az' == o
                            ? n(e, 'Sponsor dəstəkli')
                            : 'co' == o
                              ? n(e, 'Spunsurizatu')
                              : 'bs' == o || 'sl' == o || 'cs' == o
                                ? c(e, 'S', 'p', 'z', 'n')
                                : 'da' == o ||
                                    'en' == o ||
                                    'et' == o ||
                                    'fy' == o ||
                                    'it' == o ||
                                    'ku' == o ||
                                    'nb' == o ||
                                    'nn' == o ||
                                    'pl' == o ||
                                    'sq' == o ||
                                    'sv' == o ||
                                    'zz' == o
                                  ? 0 < m.length
                                    ? k[0].href.contains('en_UD')
                                      ? n(e, 'pəɹosuodS')
                                      : k[0].href.contains('ja_KS')
                                        ? n(e, '広告')
                                        : k[0].href.contains('tz_MA')
                                          ? n(e, 'ⵉⴷⵍ')
                                          : k[0].href.contains('sy_SY')
                                            ? n(e, 'ܒܘܕܩܐ ܡܡܘܘܢܐ')
                                            : k[0].href.contains('cb_IQ')
                                              ? n(e, 'پاڵپشتیکراو')
                                              : k[0].href.contains('ar_AR')
                                                ? n(e, 'مُموَّل')
                                                : k[0].href.contains('sz_PL')
                                                  ? n(e, 'Szpōnzorowane')
                                                  : k[0].href.contains('eo_EO')
                                                    ? n(e, 'Reklamo')
                                                    : k[0].href.contains('es_LA')
                                                      ? c(e, 'P', 'u', 'c', 'd')
                                                      : (c(e, 'S', 'p', 's', 'n'),
                                                        '0' == h.length && t(e, 'S', 'p', 's', 'n'),
                                                        '0' == h.length && n(e, 'Sponsored'))
                                    : document.querySelector('body').className.includes('Locale_en_UD')
                                      ? n(e, 'pəɹosuodS')
                                      : document.querySelector('body').className.includes('ja_KS')
                                        ? n(e, '広告')
                                        : document.querySelector('body').className.includes('tz_MA')
                                          ? n(e, 'ⵉⴷⵍ')
                                          : document.querySelector('body').className.includes('sy_SY')
                                            ? n(e, 'ܒܘܕܩܐ ܡܡܘܘܢܐ')
                                            : document.querySelector('body').className.includes('cb_IQ')
                                              ? n(e, 'پاڵپشتیکراو')
                                              : document.querySelector('body').className.includes('ar_AR')
                                                ? n(e, 'مُموَّل')
                                                : document.querySelector('body').className.includes('sz_PL')
                                                  ? n(e, 'Szpōnzorowane')
                                                  : document.querySelector('body').className.includes('eo_EO')
                                                    ? n(e, 'Reklamo')
                                                    : document.querySelector('body').className.includes('es_LA')
                                                      ? c(e, 'P', 'u', 'c', 'd')
                                                      : (c(e, 'S', 'p', 's', 'n'), '0' == h.length && t(e, 'S', 'p', 's', 'n'))
                                  : 'be' == o
                                    ? n(e, 'Рэклама')
                                    : 'bg' == o
                                      ? n(e, 'Спонсорирано')
                                      : 'mk' == o
                                        ? n(e, 'Спонзорирано')
                                        : 'br' == o
                                          ? n(e, 'Paeroniet')
                                          : 'ca' == o
                                            ? n(e, 'Patrocinat')
                                            : 'gl' == o || 'pt' == o
                                              ? (n(e, 'Patrocinado'), '0' == l && c(e, 'P', 'a', 'c', 'o'))
                                              : 'bn' == o
                                                ? n(e, 'সৌজন্যে')
                                                : 'cb' == o
                                                  ? n(e, 'پاڵپشتیکراو')
                                                  : 'cx' == o
                                                    ? c(e, 'G', 'i', 's', 'n')
                                                    : 'cy' == o
                                                      ? n(e, 'Noddwyd')
                                                      : 'el' == o
                                                        ? n(e, 'Χορηγούμενη')
                                                        : 'eo' == o
                                                          ? n(e, 'Reklamo')
                                                          : 'es' == o
                                                            ? c(e, 'P', 'u', 'c', 'd')
                                                            : 'eu' == o
                                                              ? n(e, 'Babestua')
                                                              : 'fa' == o
                                                                ? n(e, 'دارای پشتیبانی مالی')
                                                                : 'ff' == o
                                                                  ? n(e, 'Yoɓanaama')
                                                                  : 'fi' == o
                                                                    ? n(e, 'Sponsoroitu')
                                                                    : 'fo' == o
                                                                      ? n(e, 'Stuðlað')
                                                                      : 'fr' == o
                                                                        ? 0 < m.length
                                                                          ? k[0].href.contains('fr_FR')
                                                                            ? c(e, 'S', 'p', 's', 'n')
                                                                            : c(e, 'C', 'o', 'm', 'n')
                                                                          : document.querySelector('body').className.includes('Locale_fr_FR')
                                                                            ? c(e, 'S', 'p', 's', 'n')
                                                                            : c(e, 'C', 'o', 'm', 'n')
                                                                        : 'ga' == o
                                                                          ? n(e, 'Urraithe')
                                                                          : 'gn' == o
                                                                            ? n(e, 'Oñepatrosinapyre')
                                                                            : 'gu' == o
                                                                              ? n(e, 'પ્રાયોજિત')
                                                                              : 'ha' == o
                                                                                ? n(e, 'Daukar Nauyi')
                                                                                : 'he' == o
                                                                                  ? n(e, 'ממומן')
                                                                                  : 'hr' == o
                                                                                    ? n(e, 'Plaćeni oglas')
                                                                                    : 'ht' == o
                                                                                      ? n(e, 'Peye')
                                                                                      : 'ne' == o || 'mr' == o || 'hi' == o
                                                                                        ? n(e, 'प्रायोजित')
                                                                                        : 'hu' == o
                                                                                          ? c(e, 'H', 'i', 'r', 'd')
                                                                                          : 'hy' == o
                                                                                            ? n(e, 'Գովազդային')
                                                                                            : 'id' == o
                                                                                              ? c(e, 'B', 'e', 'p', 'n')
                                                                                              : 'is' == o
                                                                                                ? n(e, 'Kostað')
                                                                                                : 'ja' == o
                                                                                                  ? n(e, '広告')
                                                                                                  : 'ms' == o
                                                                                                    ? n(e, 'Ditaja')
                                                                                                    : 'jv' == o
                                                                                                      ? n(e, 'Disponsori')
                                                                                                      : 'ka' == o
                                                                                                        ? n(e, 'რეკლამა')
                                                                                                        : 'kk' == o
                                                                                                          ? n(e, 'Демеушілік көрсеткен')
                                                                                                          : 'km' == o
                                                                                                            ? n(e, 'បានឧបត្ថម្ភ')
                                                                                                            : 'kn' == o
                                                                                                              ? n(e, 'ಪ್ರಾಯೋಜಿತ')
                                                                                                              : 'ko' == o
                                                                                                                ? n(e, 'Sponsored')
                                                                                                                : 'ky' == o
                                                                                                                  ? n(e, 'Демөөрчүлөнгөн')
                                                                                                                  : 'lo' == o
                                                                                                                    ? n(e, 'ຜູ້ສະໜັບສະໜູນ')
                                                                                                                    : 'lt' == o
                                                                                                                      ? n(e, 'Remiama')
                                                                                                                      : 'lv' == o
                                                                                                                        ? n(e, 'Apmaksāta reklāma')
                                                                                                                        : 'mg' == o
                                                                                                                          ? n(e, 'Misy Mpiantoka')
                                                                                                                          : 'ml' == o
                                                                                                                            ? n(e, 'സ്പോൺസർ ചെയ്തത്')
                                                                                                                            : 'mn' == o
                                                                                                                              ? n(e, 'Ивээн тэтгэсэн')
                                                                                                                              : 'mt' == o
                                                                                                                                ? n(e, 'Sponsorjat')
                                                                                                                                : 'my' == o
                                                                                                                                  ? (n(e, 'ပံ့ပိုးထားသည်'),
                                                                                                                                    '0' == l &&
                                                                                                                                      n(e, 'အခပေးကြော်ငြာ'))
                                                                                                                                  : 'or' == o
                                                                                                                                    ? n(e, 'ପ୍ରଯୋଜିତ')
                                                                                                                                    : 'pa' == o
                                                                                                                                      ? n(e, 'ਸਰਪ੍ਰਸਤੀ ਪ੍ਰਾਪਤ')
                                                                                                                                      : 'ps' == o
                                                                                                                                        ? n(e, 'تمويل شوي')
                                                                                                                                        : 'ro' == o
                                                                                                                                          ? n(e, 'Sponsorizat')
                                                                                                                                          : 'ru' == o ||
                                                                                                                                              'uk' == o
                                                                                                                                            ? n(e, 'Реклама')
                                                                                                                                            : 'rw' == o
                                                                                                                                              ? n(
                                                                                                                                                  e,
                                                                                                                                                  'Icyamamaza ndasukirwaho',
                                                                                                                                                )
                                                                                                                                              : 'sc' == o
                                                                                                                                                ? n(
                                                                                                                                                    e,
                                                                                                                                                    'Patronadu de',
                                                                                                                                                  )
                                                                                                                                                : 'si' == o
                                                                                                                                                  ? n(
                                                                                                                                                      e,
                                                                                                                                                      'අනුග්රාහක',
                                                                                                                                                    )
                                                                                                                                                  : 'sk' == o
                                                                                                                                                    ? n(
                                                                                                                                                        e,
                                                                                                                                                        'Sponzorované',
                                                                                                                                                      )
                                                                                                                                                    : 'sn' == o
                                                                                                                                                      ? n(
                                                                                                                                                          e,
                                                                                                                                                          'Zvabhadharirwa',
                                                                                                                                                        )
                                                                                                                                                      : 'so' ==
                                                                                                                                                          o
                                                                                                                                                        ? n(
                                                                                                                                                            e,
                                                                                                                                                            'La maalgeliyey',
                                                                                                                                                          )
                                                                                                                                                        : 'sr' ==
                                                                                                                                                            o
                                                                                                                                                          ? n(
                                                                                                                                                              e,
                                                                                                                                                              'Спонзорисано',
                                                                                                                                                            )
                                                                                                                                                          : 'sw' ==
                                                                                                                                                              o
                                                                                                                                                            ? n(
                                                                                                                                                                e,
                                                                                                                                                                'Imedhaminiwa',
                                                                                                                                                              )
                                                                                                                                                            : 'sy' ==
                                                                                                                                                                o
                                                                                                                                                              ? n(
                                                                                                                                                                  e,
                                                                                                                                                                  'ܒܘܕܩܐ ܡܡܘܘܢܐ',
                                                                                                                                                                )
                                                                                                                                                              : 'sz' ==
                                                                                                                                                                  o
                                                                                                                                                                ? n(
                                                                                                                                                                    e,
                                                                                                                                                                    'Szpōnzorowane',
                                                                                                                                                                  )
                                                                                                                                                                : 'ta' ==
                                                                                                                                                                    o
                                                                                                                                                                  ? n(
                                                                                                                                                                      e,
                                                                                                                                                                      'விளம்பரம்',
                                                                                                                                                                    )
                                                                                                                                                                  : 'te' ==
                                                                                                                                                                      o
                                                                                                                                                                    ? n(
                                                                                                                                                                        e,
                                                                                                                                                                        'ప్రాయోజితం చేయబడింది',
                                                                                                                                                                      )
                                                                                                                                                                    : 'tg' ==
                                                                                                                                                                        o
                                                                                                                                                                      ? n(
                                                                                                                                                                          e,
                                                                                                                                                                          'Бо сарпарастӣ',
                                                                                                                                                                        )
                                                                                                                                                                      : 'th' ==
                                                                                                                                                                          o
                                                                                                                                                                        ? n(
                                                                                                                                                                            e,
                                                                                                                                                                            'ได้รับการสนับสนุน',
                                                                                                                                                                          )
                                                                                                                                                                        : 'tl' ==
                                                                                                                                                                            o
                                                                                                                                                                          ? n(
                                                                                                                                                                              e,
                                                                                                                                                                              'May Sponsor',
                                                                                                                                                                            )
                                                                                                                                                                          : 'tr' ==
                                                                                                                                                                              o
                                                                                                                                                                            ? n(
                                                                                                                                                                                e,
                                                                                                                                                                                'Sponsorlu',
                                                                                                                                                                              )
                                                                                                                                                                            : 'tt' ==
                                                                                                                                                                                o
                                                                                                                                                                              ? n(
                                                                                                                                                                                  e,
                                                                                                                                                                                  'Хәйрияче',
                                                                                                                                                                                )
                                                                                                                                                                              : 'tz' ==
                                                                                                                                                                                  o
                                                                                                                                                                                ? n(
                                                                                                                                                                                    e,
                                                                                                                                                                                    'ⵉⴷⵍ',
                                                                                                                                                                                  )
                                                                                                                                                                                : 'ur' ==
                                                                                                                                                                                    o
                                                                                                                                                                                  ? n(
                                                                                                                                                                                      e,
                                                                                                                                                                                      'سپانسرڈ',
                                                                                                                                                                                    )
                                                                                                                                                                                  : 'uz' ==
                                                                                                                                                                                      o
                                                                                                                                                                                    ? n(
                                                                                                                                                                                        e,
                                                                                                                                                                                        'Reklama',
                                                                                                                                                                                      )
                                                                                                                                                                                    : 'vi' ==
                                                                                                                                                                                        o
                                                                                                                                                                                      ? n(
                                                                                                                                                                                          e,
                                                                                                                                                                                          'Được tài trợ',
                                                                                                                                                                                        )
                                                                                                                                                                                      : 'zh-Hans' ==
                                                                                                                                                                                          o
                                                                                                                                                                                        ? n(
                                                                                                                                                                                            e,
                                                                                                                                                                                            '赞助内容',
                                                                                                                                                                                          )
                                                                                                                                                                                        : 'zh-Hant' ==
                                                                                                                                                                                            o &&
                                                                                                                                                                                          n(
                                                                                                                                                                                            e,
                                                                                                                                                                                            '贊助',
                                                                                                                                                                                          ),
            0 < h.length && 0 < p.length && 0 < d.length && 0 < u.length)
          ) {
            for (cont = 0; cont < h.length; cont++) 0 < h[cont].offsetHeight && ((cont = h.length), (s = 1));
            for (cont1 = 0; cont1 < p.length; cont1++) 0 < p[cont1].offsetHeight && ((cont1 = p.length), (l = 1));
            for (cont2 = 0; cont2 < d.length; cont2++) 0 < d[cont2].offsetHeight && ((cont2 = d.length), (r = 1));
            for (cont3 = 0; cont3 < u.length; cont3++) 0 < u[cont3].offsetHeight && ((cont3 = u.length), (i = 1));
            1 == s &&
              1 == l &&
              1 == r &&
              1 == i &&
              ((0 < m.length && '' != (y = e.querySelectorAll('a[href]')[1].innerText)) || (y = e.querySelectorAll('a[href]')[2].innerText),
              (T += 1),
              (e.style = 'display:none!important;'));
          }
        });
      }),
      T = 0;
    e.observe(document, {
      childList: !0,
      subtree: !0,
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
    facebook.apply(this, updatedArgs);
  } catch (e) {
    console.log(e);
  }
}

export default facebook;
