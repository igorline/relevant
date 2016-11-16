import { NavigationExperimental } from 'react-native';
import {
  PUSH_ROUTE,
  POP_ROUTE,
  CHANGE_TAB,
  RESET_ROUTES,
  REFRESH_ROUTE,
  REPLACE_ROUTE,
  RELOAD_ROUTE,
  RELOAD_ALL_TABS
} from '../actions/actionTypes';

const {
 StateUtils: NavigationStateUtils
} = NavigationExperimental;

const scaleNum = 1.3;

const readIcon = {
  scale: scaleNum,
  uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAYAAADE6YVjAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoTWFjaW50b3NoKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo5Q0FCRDFEMzkzRjYxMUU2QUIwM0IxM0I2OTVEMkRDNiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo5Q0FCRDFENDkzRjYxMUU2QUIwM0IxM0I2OTVEMkRDNiI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkZGNUU5NTZFOTNGNDExRTZBQjAzQjEzQjY5NUQyREM2IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjlDQUJEMUQyOTNGNjExRTZBQjAzQjEzQjY5NUQyREM2Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+c9P1yAAAA7dJREFUeNqsVltLVFEUXufMmTzOjLdsvOLoaCJeMhEVlehBgi5EvRRBD0YGFUXP/YIe6iGCeu5JkIggegwfhLxLaWRNDz6IoaUzQs7ojJfjOe1v2T6dyqnTZcFGzt57rW993/72HlXLssjNiDy4d2HYR1Yk5LdeBsl6dfPabbe5GrkMrxgVKtE+j0JrIuuTSq7jD7YSWY7xJ+EaRN2zJ+VEUzVt023ub+Waefzo0MeHDy+XJGLlgYBOppjL8OmkDz4/NXb+aIWv68TTA5duPCFF/XsmZceOTwbyssk79OqwrnlYKq/XS3rkfaMnGQ+FT5598SuAHeYu3GFsb9P01Yv3P/jJ2gr7rWghWa/PHXm2Hl/R3eSTWxsapklvr/fceecl682ZI49SibjrXGVjY4PW1tYq8vLy9m6LjtOFoqqmsbVF7+7fvbK/u6fPFyz4bBqGlk4dTdMoHo8nhbTvlbm5Oerr63va3d19uqioiEzT3DVpB0khVVWT26aVKRCV7yRxSA+AlZUV6u3tfdvV1XVQxWQ4HFanpqZofn4eRXgooiCGE8gUTAUb348AvCaaw/B4PBSLxWhsbIwqKysV8a2okEhIZXZ2dtLo6CiBGcIwjLRjS8gm/zoHYnFxkQYHB6m1tZVKSkpM1GfvbW5uUnZ2NnV0dDDQ7OwsU/4dgHNOAgwNDVFLSwtB+vX19W+XEWipVIqysrKovb2dNyIxFAoRjOGUZDeZ0NDS0hJL1NbWRoWFhVxPGkmD7vhAUSAHAgHeODw8zHNlZWXMNB2QBBgfH2cGBQUFlEwmKSMjg1naTPCBQlJbAEHTkZERXistLf0OyMkgGo0yg+bmZhuAnxJhHgmiSrmcBwiqAEJnAwMDNDMzw05z7sE3GPT391NDQ4MN4NxjM3HKJQ9QFoR8dXV1NDk5yZ2DEeYkg4mJCaqpqeGc1dVVtq+8M04m9sFLuQCAgvA6ipWXl7PzUFCaQZ5BY2MjbErLy8t8x4LBIOfwUyLq/ATitCQAMjMzuTgk8Pl81NTUxIzQMSxeW1tL+fn5eJJ4HY0tLCzwHA5d1gOYLRcGCqIrWBlnAnbSGH6/nztHx5AIxeQ9QOi6zgxwV3JzcyknJ+ebheWTkUgkWGdsAAsJIANAKFRdXc37cX9++j9A/M4gH41KB9oHLxI00IZDQBWLOLi0L/LOQ7nrGhosLi7GCwyXarZc09PTUUE9JvaY9ov7D/G1CSUSiSziYmvQtr6+/qZAvgUQ+n+hVFVVpcSLYXwRYABg+nJnjxSt2wAAAABJRU5ErkJggg=='
};

const discoverIcon = {
  scale: scaleNum,
  uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAYAAADE6YVjAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoTWFjaW50b3NoKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpGRjVFOTU2QzkzRjQxMUU2QUIwM0IxM0I2OTVEMkRDNiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpGRjVFOTU2RDkzRjQxMUU2QUIwM0IxM0I2OTVEMkRDNiI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkZGNUU5NTZBOTNGNDExRTZBQjAzQjEzQjY5NUQyREM2IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkZGNUU5NTZCOTNGNDExRTZBQjAzQjEzQjY5NUQyREM2Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+M2jrogAABq9JREFUeNqMVXuM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'
};

const createPostIcon = {
  scale: scaleNum,
  uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAYAAADE6YVjAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoTWFjaW50b3NoKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo2NkQ3QjRCODkzRjgxMUU2QUIwM0IxM0I2OTVEMkRDNiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo2NkQ3QjRCOTkzRjgxMUU2QUIwM0IxM0I2OTVEMkRDNiI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjY2RDdCNEI2OTNGODExRTZBQjAzQjEzQjY5NUQyREM2IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjY2RDdCNEI3OTNGODExRTZBQjAzQjEzQjY5NUQyREM2Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+oVpJaQAABNVJREFUeNqslmtMW2UYx/89vdPTG6XYTURAGFAnTLZsFITovrBhon7TwBzivCQmZib6Ab8Yl8UvLpma6beNBROijs0l0xBYZM1i6Gg0MjfnWEcRuRVKCxTa0nt9nwNtWtiICXuT057zntPn9/yf26komUyClsfjwcrKCh7F0ul00Ov16WsRQWKxGLq7u18tLi5+ne0lt8kQTU1NnWlpaelPbUjoI5FIwGAw7G1sbHzxUSjp7esjQBrCCWiRiEARUpUK38bvjYsci8fjWddYD4PLOWqamZxUZykRaBwHn8+HgYEByOVy5OTkCIBAIACj0SjkTKFQQCKRYHl5GYWFhZiYmIBGo4Hf78fS0hIK2J6zrw/ebzs7bp0/2+p+970TVW+/cz4NobxotVo0NzcLHpIxgpCH5ADdp4McoPsymQxms1k4l0qlsFqt+Orrb1DhnUeTmuca8g1PurrOdo7xfCgNoZAFg0E4nU4BRudkgCqFvFSpVAI0FAoJz5ITkUgEvFqH0dH7OHeuEwf27cPTe/ag7O9biPf+hB3Mzs2uzpNpCBmgH1MZk/xwOJw2SEAKESmhPVJGkHiSg3f4V1z5+RdUVD6LivJdKC4oAGpqEJIrcOfMl7gejckkmYkj2fX19VkJToWMYGQ8cy25xzBk+wivlLMw7m1hvfE4TPlGrDIHb5Sb0aPWhxpaW9/ISvzi4iLsdjtSVUbhIDCFjxKfl5cHr9cDiZwHF3YjMnwa6qQLh94sAV/6OyuEarjnl+G4dxsXL12Cvr6h/+jxD66lIRR/qiiLxZL2nsJDClKVRkc4xhS47uJm94fQSzywtJsZQMtCYWcVJ8bly8+g52IvZFJx3ycfd7RzmSVMKxqNYnZ2FmKxWDgoL0qlUsgH5Ump0kGWWITjx+PQiz2oa6uEpowHIows4+H5oxeu/i5IuUbr56e+eC3faPRhI4SMzszMCKGjnlhdXRVKlRRxYimcd4awYDuFkrwQLG0Va4BV1pBKCeZ+c+NGtxM1zx3BDtXB71OANIRCkqp9CpdQOeya1NC30Cesknqsp/GE3g/LEfMaILQGmLXPw/6DA4/tb0fpoU8xZb0mz3Q+q0+ou202m3BNYSLjFEJ2F67pfzDimMRbrdXQlEvXFCjEDODB4Hd3IS15CbsOn0AsGkEyEcUDIeQxGWZDUugL6mxKNIFk8hxcufAXCgt4TLl2wjTiR37lKubsXgxdGMXOA8dQ+EIH4rEog4SxcdxlKaHkzs3NCTA6JwjBGQor7hGUl5gg5sQYtmthcCzAcfU2FE+9DOXuY/AtLUKv0yBzyG6CpNQQhHqD8kNlHAyGMO9ywpDjh16jxb/THoxO+BAIq1Bd/T70uw9jzHkfWo0aOm1leho/NFxUUbW1tenOXptRMnx28ipyEx5EEiyEyirsb6pBcVkVdLlG9taLCQOevKf8EeShSlKJHxwchMlkwsLCAniex/T0NGxDf6LtaCsanj8IXpMLsYh6KoJIyL/J6we9f7JmFympq6sTHiwqKhL2SktL0dTUxKatBmE2HCOhwJZvxS2VpJJMuUgpy1wB///7k7ElhDUglyrb7az1JuY2Qcjr8fFxP3sgyCCJ7UCYEhHLZ2ATZH0gdvb3918nZ7b5Z4Vj76R7mRv/CTAARXmHHbg5+AQAAAAASUVORK5CYII=',
};

const activityIcon = {
  scale: scaleNum,
  uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAYAAADE6YVjAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoTWFjaW50b3NoKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDoxREIyN0Y1NTk0QTkxMUU2OEQ1NkU1Nzk3RjU4MENDNSIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDoxREIyN0Y1Njk0QTkxMUU2OEQ1NkU1Nzk3RjU4MENDNSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjFEQjI3RjUzOTRBOTExRTY4RDU2RTU3OTdGNTgwQ0M1IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjFEQjI3RjU0OTRBOTExRTY4RDU2RTU3OTdGNTgwQ0M1Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+jJmvVgAABLlJREFUeNqkVltoXEUY/mbOLWfdzc1Yogi1NUYUxKIPSrEKoqBS7VMK0tJSRKRUBVEKKhZfxEKrfQklgoKYCkVQE0GISGJFQS34oGDVXNQkeMvF7G52z33O+M+cbDa7EZPowtmZ85+ZM/P93/d/c5iUEuq3uLiIcrms+4wuuab9LzHXddHd3a1jpvoTQuDdoQ8evrG355CgVRMh4ZgcQZLCNjhNkthKzDY5m5iYGOvr6ztVKBSyRWSaorWt85bde/bcJ+g+oj/XAHxqbSPb4VZiOepXvCCJovAUsLKIXkimUUo40ySBSKjjGBA0Q1q0Q0rppmL0AiENSE5JkyLIkgfw+iJSD0prl1zT32zMMCF/m6b3J5A1ktYuolD4tKOArigW8MMEoWo3GyNUUXEJcvR9RNSPiRu28u7VdDEmcZnNkBDUIAbyDqfdpXAppna1YSxnIRkdQfLnDNwWi8ivK86s6U7BLXkRKS3Vu0hlqncc07164b/GUgPx9AzSj4YgHzwIHksEhJCxJiRqFnEHrrihi/hETPcqJjeKGQbC4UHIjitg3343WriEocc0caI0rmCrS6ERK+1GsdSyIb77Gv5XF2A+dBApN6lWEi0itgLFrNUpoaZUJKvpMogjRaiUfDU1jTEiVzLwZQ/L5wdg3Xwb0ut3IapW4aNFp3Qd8QpLzmIQhC2gp0oEImVwLaZfuD5GhWfnIMaGEUxPoevYs2BcgBnZOMtoIp5pCSviY0qDyAildHhaplxvYF2MeIgWfsfyuQGwu/ah2nk10nIlQ0z1EkR1JHwt8coaFKkGPXVM2g2ZnE0Bi4g0mS5u3dqGREuuBcX33gRlH21798OMAz13dRyvI2moeGWUgpAQPUh8D6WhtyDjSJOp4uq5QpoaFoLJSyh/eB6t+x8FK7RB0DgtDC0IoVE3VjzL0qWqNwgpXaaD2eF3MHPyOCZOPgfPCxDBgKerO6UiTPHLwCuwdvTC2X0vfDoiAu0C6nmSpVQRz5qQqHtFfL41h3j8W8wP9qP90JPwfvgGsyeOwoo9FAou3HwOwcUxLH15AV2Hn0DBNeFQOnNEtprvUK4V8apdVycKZol2WiqW8dPpF8B23oCOR46j+8WzKP08ifGnD2Pxj3ll4ZjsfxnunfdD9OzC0l9lVNQ8cgslnEoYo1iN4JPUa3XSgMTN5bD82Qj8qUvoeeoEjNhH+46duKn/bXjFIr5/5gjm3jiNYGEO248cgykiLZBMDCwTjhZNJoAmF85qgRwJ/vwcth04Cuea65AEPhKvCnZ5N659dZDOCmDqzBlceeAx2FdtRxIGWfXLuguovtBt3esb6qRKOndvvQNo34ZKsYQwyYwQ4TLZbQd6XzqL2XOvoe2efaiUyogTQSRLLQZlI7V6UgL6x4rXxBtk2ZQepZS8RQuLWnXTOU510NbVCePx5+EgpoNJICRbydtcO3jNBUKW2b/TXPF6Ec6NSJr6vBeUxZCOUUHExcg+EFJSUJCQh5FMualiZDHKy5rG6VhKJgnDbEwXDfp1dqb4xeefFimvqYKcIxaV3m1zxQy3ECu4Dp8c/3HB2PvAmkU4R961X/9k9OMRRQ/+/4/TN9dcPp/XN38LMABp/KWDi65tvAAAAABJRU5ErkJggg==',
};

const profileIcon = {
  scale: scaleNum,
  uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAYAAADE6YVjAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoTWFjaW50b3NoKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDoxREIyN0Y1MTk0QTkxMUU2OEQ1NkU1Nzk3RjU4MENDNSIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDoxREIyN0Y1Mjk0QTkxMUU2OEQ1NkU1Nzk3RjU4MENDNSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjFEQjI3RjRGOTRBOTExRTY4RDU2RTU3OTdGNTgwQ0M1IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjFEQjI3RjUwOTRBOTExRTY4RDU2RTU3OTdGNTgwQ0M1Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+veHuxAAAAw1JREFUeNrcVktPE1EUvvfO9P2YQiktLYUWhShoNSJCRDQYMcYuXJmQuDBRI3HvyoUru3Vj2Bi3/gMIiYKYIOlKIiSGIEZetQ+0QKGPmc7MHe+dFkyKoQmDLrzJZNrcO993zvm+c2agoijgby8E/sFiqx2IxWIgl8sCjDEwW7k6xLAGPr+TEIUCZhgdsFhtoLHRdyAGrFaugYFrYOpDlAv1XH/S0t51DyJkzG1vfPu+ND8yPzP1orenM/l2fEJbJhbO1dZ94+4bf7C1GWMZ0KBstZ5QR70/ZHZ4b+uV1GVyLKlJk2MdFx64GpqaZUkEWKYkGNDfpFyg3hdoPXHuymPNwpss9qBIQOVyFgpW1HvpPwaCjLplQq6JZOtn4iMVnYLT++5VIsOgKEqmarpW1YTPZ5NY1gOskKMVYJgQFfl8ipJpIjFa7H6cLQAqOqgIWM1KQUZiUm0kEEIDLQcFrFxUC7PZpkMIadPkR3xpQuDzMq1UpSaiKAJWEaYZhtFGklpdmFxbnHuNEEOA8d5FUgTp1NqXr3PTEc0WpqKmE8sTkiSR+pcdRq1M9jLEeWTEZDWT0Awy66sj25vrK1RglUChriqIscVPz/e54VBTmJQlGOobNlm5Rol2PclEbT6I2Ob27mdmW42jKgSNanR0FEQikbItZXV8sDo9mVHuzozA3re6Ao+Iy8C+poMIGJA063cah9PJ5bHCzmaMZkYmNd0EQ0NDIBwOlywcj8dBNBrdfdLjaGi55W46eQdD9yWLyw6pLn+yMIQYFGR4ZnY585LPMZl0IjuWWPr8SspvqGO5v7//NwnLIGC0OnsD7ecf1noCYZPV7lQtKxOxZfEAU5Qb1qADJqOLc9Y3DB4/1TWYTqy8W5iZfMoyzPReM9rrfBfbesLv61xuViagYlE4xPuPaiWpGjq9wattrLnP4W66STbG2fLoOI1YAysI/BG8bMmElgXA6A06gnt2j0QiofPZLcwq5iP7qihkc1AqlqJW3ZXJbHOxeMJLe+KoFrW5z+tJ1ji4TfjffBL9EmAAtcGnA5mzoq8AAAAASUVORK5CYII=',
};


const initialState = {
  reload: 0,
  main: 'home',
  tabs: {
    index: 0,
    key: 'root',
    routes: [
      // { key: 'auth', icon: '', title: 'Auth', hide: true },
      { key: 'read', icon: '📩', title: 'Read', regIcon: readIcon },
      { key: 'discover', icon: '🔮', title: 'Discover', regIcon: discoverIcon },
      { key: 'createPost', icon: '📝', title: 'Create Post', regIcon: createPostIcon },
      { key: 'activity', icon: '⚡', title: 'Activity', regIcon: activityIcon },
      { key: 'myProfile', icon: '👤', title: 'Profile', regIcon: profileIcon }
    ],
  },
  home: {
    index: 0,
    key: 'home',
    routes: [{
      key: 'home',
      component: 'stallScreen',
      title: 'Relevant'
    }],
  },
  read: {
    index: 0,
    key: 'read',
    refresh: null,
    reload: 0,
    routes: [{
      key: 'read',
      component: 'read',
      title: 'Read'
    }],
  },
  discover: {
    index: 0,
    key: 'read',
    refresh: null,
    reload: 0,
    routes: [{
      key: 'discover',
      component: 'discover',
      title: 'Discover'
    }],
  },
  createPost: {
    index: 0,
    key: 'createPost',
    reload: 0,
    routes: [{
      key: 'createPost',
      component: 'createPost',
      title: 'Create Post',
    }],
  },
  activity: {
    index: 0,
    key: 'activity',
    refresh: null,
    reload: 0,
    routes: [{
      key: 'activity',
      component: 'activity',
      title: 'Activity'
    }],
  },
  myProfile: {
    index: 0,
    key: 'myProfile',
    refresh: null,
    reload: 0,
    routes: [{
      key: 'myProfile',
      component: 'myProfile',
      title: 'Profile'
    }],
  },
};

function guid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    let r = Math.random() * 16 | 0;
    let v = c === 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
}

function navigationState(state = initialState, action) {
  switch (action.type) {
    // push to tab scene stack
    case PUSH_ROUTE: {
      const activeTabIndex = state.tabs.index;
      const activeTabKey = action.key || state.tabs.routes[activeTabIndex].key;
      const scenes = {
        ...state[activeTabKey],
        animation: action.animation,
      };

      let route = action.route;
      route.component = action.route.key;
      route.key = guid();

      const nextScenes = NavigationStateUtils.push(scenes, route);

      if (scenes !== nextScenes) {
        return {
          ...state,
          [activeTabKey]: nextScenes,
        };
      }

      return state;
    }

    // pop from tab scene stack
    case POP_ROUTE: {
      let key = action.key || state.tabs.routes[state.tabs.index].key;
      const scenes = state[key];
      const nextScenes = NavigationStateUtils.pop(scenes);

      if (scenes !== nextScenes) {
        return {
          ...state,
          [key]: nextScenes,
        };
      }
      return state;
    }

    case RESET_ROUTES: {
      const key = action.key || state.tabs.routes[state.tabs.index].key;
      const prevScenes = {
        ...state[key],
        animation: 'reset',
      };
      const nextChildren = prevScenes.routes.slice(0, 1);
      const nextIndex = 0;
      const nextScenes = NavigationStateUtils.reset(prevScenes, nextChildren, nextIndex);

      return {
        ...state,
        [key]: nextScenes,
      };
    }

    case REFRESH_ROUTE: {
      const key = action.key || state.tabs.routes[state.tabs.index].key;
      return {
        ...state,
        [key]: {
          ...state[key],
          refresh: new Date().getTime()
        },
      };
    }

    case RELOAD_ROUTE: {
      const key = action.key || state.tabs.routes[state.tabs.index].key;
      return {
        ...state,
        [key]: {
          ...state[key],
          reload: new Date().getTime()
        },
      };
    }

    // navigate to a new tab stack
    case CHANGE_TAB: {
      const nextTabs = NavigationStateUtils.jumpTo(state.tabs, action.key);

      if (nextTabs !== state.tabs) {
        return {
          ...state,
          tabs: nextTabs,
        };
      }
      return state;
    }

    case REPLACE_ROUTE: {
      const key = action.payload.key || state.tabs.routes[state.tabs.index].key;
      let newScene = NavigationStateUtils.replaceAtIndex(
        state[key],
        action.payload.index,
        action.payload.route
      );
      return {
        ...state,
        [key]: newScene
      };
    }

    case RELOAD_ALL_TABS: {
      return {
        ...state,
        reload: new Date().getTime()
      };
    }

    // case ACTIONS.TOGGLE_MODAL: {
    //     return {
    //         ...state,
    //         modal: {
    //             ...state.modal,
    //             isModalActive: !state.modal.isModalActive,
    //             modalKey: action.modalKey,
    //             modalViewStyle: action.modalViewStyle,
    //         }
    //     }
    // }

    default:
      return state;
  }
}

export default navigationState;
