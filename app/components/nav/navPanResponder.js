const Animated = require('Animated');
const I18nManager = require('I18nManager');
const PanResponder = require('PanResponder');
const InteractionManager = require('InteractionManager');
const clamp = require('clamp');

// import type {
//   NavigationPanPanHandlers,
//   NavigationSceneRendererProps,
// } from 'NavigationTypeDefinition';

const emptyFunction = () => {};

/**
 * The duration of the card animation in milliseconds.
 */
const ANIMATION_DURATION = 200;

/**
 * The threshold to invoke the `onNavigateBack` action.
 * For instance, `1 / 3` means that moving greater than 1 / 3 of the width of
 * the view will navigate.
 */
const POSITION_THRESHOLD = 1 / 3;

/**
 * The threshold (in pixels) to start the gesture action.
 */
const RESPOND_THRESHOLD = 12;

/**
 * The threshold (in pixels) to finish the gesture action.
 */
const DISTANCE_THRESHOLD = 35;


const GESTURE_ANIMATED_VELOCITY_RATIO = -4;

/**
 * Primitive gesture directions.
 */
const Directions = {
  'HORIZONTAL': 'horizontal',
  'VERTICAL': 'vertical',
};

export type NavigationGestureDirection =  'horizontal' | 'vertical';

type Props = NavigationSceneRendererProps & {
  onNavigateBack: ?Function,
  /**
  * The distance from the edge of the navigator which gesture response can start for.
  **/
  gestureResponseDistance: ?number,
};

/**
 * Pan responder that handles gesture for a card in the cards stack.
 *
 *     +------------+
 *   +-+            |
 * +-+ |            |
 * | | |            |
 * | | |  Focused   |
 * | | |   Card     |
 * | | |            |
 * +-+ |            |
 *   +-+            |
 *     +------------+
 */
class NavPanResponder {

  _isResponding: boolean;
  _isVertical: boolean;
  _props: Props;
  _startValue: number;

  constructor(
    direction: NavigationGestureDirection,
    props: Props,
  ) {
    // super();
    this._isResponding = false;
    this._isVertical = direction === Directions.VERTICAL;
    this._props = props;
    this._startValue = 0;

    // Hack to make this work with native driven animations. We add a single listener
    // so the JS value of the following animated values gets updated. We rely on
    // some Animated private APIs and not doing so would require using a bunch of
    // value listeners but we'd have to remove them to not leak and I'm not sure
    // when we'd do that with the current structure we have. `stopAnimation` callback
    // is also broken with native animated values that have no listeners so if we
    // want to remove this we have to fix this too.
    this._addNativeListener(this._props.layout.width);
    this._addNativeListener(this._props.layout.height);
    this._addNativeListener(this._props.position);
    this.reject = false;

    const EmptyPanHandlers = {
      onMoveShouldSetPanResponder: null,
      onPanResponderGrant: null,
      // onStartShouldSetPanResponder: null,
      // onPanResponderReject: null,
      onPanResponderTerminationRequest: null,
      onPanResponderMove: null,
      onPanResponderRelease: null,
      onPanResponderTerminate: null,
    };

    const config = {};
    Object.keys(EmptyPanHandlers).forEach(name => {
      let fn = this[name];
      fn = fn.bind(this);
      config[name] = fn;
    }, this);

    this._panResponder = PanResponder.create(config);
    this.panHandlers = this._panResponder.panHandlers;
  }

  onMoveShouldSetPanResponder(event: any, gesture: any): boolean {
    const props = this._props;
    const layout = props.layout;

    if (props.position._value !== parseInt(props.position._value)) return false;

    if (props.scrolling) return false;

    if (props.navigation.state.index !== props.scene.index) {
      return false;
    }

    const isVertical = this._isVertical;
    const index = props.navigation.state.index;

    const immediateIndex = this._immediateIndex == null
      ? index
      : this._immediateIndex;
    const currentDragDistance = gesture[isVertical ? 'dy' : 'dx'];
    const currentDragPosition = event.nativeEvent[
      isVertical ? 'pageY' : 'pageX'
    ];
    const axisLength = isVertical
      ? layout.height.__getValue()
      : layout.width.__getValue();
    const axisHasBeenMeasured = !!axisLength;

    // Measure the distance from the touch to the edge of the screen
    const screenEdgeDistance = currentDragPosition - currentDragDistance;
    // Compare to the gesture distance relavant to card or modal
    const gestureResponseDistance = isVertical
      ? props.gestureResponseDistance
      : props.gestureResponseDistance || 30;
    // GESTURE_RESPONSE_DISTANCE is about 30 or 35. Or 135 for modals
    if (screenEdgeDistance > gestureResponseDistance) {
      // Reject touches that started in the middle of the screen
      return false;
    }

    const hasDraggedEnough = Math.abs(currentDragDistance) >
      RESPOND_THRESHOLD;

    const isOnFirstCard = immediateIndex === 0;
    const shouldSetResponder = hasDraggedEnough &&
      axisHasBeenMeasured &&
      !isOnFirstCard;

    return shouldSetResponder;
  }

  onPanResponderGrant(event: any, gesture: any) {
    this._props.position.stopAnimation((value: number) => {
      this._isResponding = true;

      // we don't care for it to be 0 anyway
      // and this fixes the bug of swipe jump on application first start
      this._startValue = value || 1;
    });

    // prevents bug when transition gets interrupted
    // so that InteractionManager still works
    // if (this._panResponder.getInteractionHandle()) {
    //   InteractionManager.clearInteractionHandle(this._panResponder.getInteractionHandle());
    // }
  }

  onPanResponderMove(event: any, gesture: any): void {
    // Handle the moving touches for our granted responder
    const props = this._props;
    const layout = this._props.layout;
    const index = props.navigation.state.index;
    const isVertical = this._isVertical;
    const startValue = this._startValue;
    const axis = isVertical ? 'dy' : 'dx';
    const distance = isVertical
      ? layout.height.__getValue()
      : layout.width.__getValue();
    const currentValue = I18nManager.isRTL && axis === 'dx'
      ? startValue + gesture[axis] / distance
      : startValue - gesture[axis] / distance;
    const value = clamp(index - 1, currentValue, index);
    props.position.setValue(value);
  }

  onPanResponderTerminationRequest() {
    // Returning false will prevent other views from becoming responder while
    // the navigation view is the responder (mid-gesture)
    return false;
  }

  onPanResponderRelease(event: any, gesture: any) {
    if (!this._isResponding) {
      return;
    }
    this._isResponding = false;

    const props = this._props;
    const isVertical = this._isVertical;
    const index = props.navigation.state.index;
    const velocity = gesture[isVertical ? 'vy' : 'vx'];
    const immediateIndex = this._immediateIndex == null
      ? index
      : this._immediateIndex;

    // To asyncronously get the current animated value, we need to run stopAnimation:
    props.position.stopAnimation((value: number) => {
      // If the speed of the gesture release is significant, use that as the indication
      // of intent
      if (velocity < -0.5) {
        this._reset(immediateIndex, velocity);
        return;
      }
      if (velocity > 0.5) {
        this._goBack(immediateIndex, velocity);
        return;
      }

      // Then filter based on the distance the screen was moved. Over a third of the way swiped,
      // and the back will happen.
      if (value <= index - POSITION_THRESHOLD) {
        this._goBack(immediateIndex, velocity);
      } else {
        this._reset(immediateIndex, velocity);
      }
    });
  }

  onPanResponderTerminate(): void {
    const index = this._props.navigation.state.index;
    this._isResponding = false;
    this._reset(index, 0);
  }

  _reset(resetToIndex: number, velocity: number): void {
    const props = this._props;
    Animated.spring(props.position, {
      toValue: resetToIndex,
      duration: ANIMATION_DURATION,
      useNativeDriver: props.position.__isNative,
      velocity: velocity * GESTURE_ANIMATED_VELOCITY_RATIO,
      overshootClamping: true,
    }).start();
  }

  _goBack(backFromIndex: number, velocity: number) {
    const props = this._props;
    const { navigation, position, scenes } = props;
    const toValue = Math.max(backFromIndex - 1, 0);

    // set temporary index for gesture handler to respect until the action is
    // dispatched at the end of the transition.
    this._immediateIndex = toValue;
    // props.onNavigateBack()

    this.animating = true;
    Animated.spring(position, {
      toValue,
      duration: ANIMATION_DURATION,
      useNativeDriver: position.__isNative,
      velocity: velocity * GESTURE_ANIMATED_VELOCITY_RATIO,
      bounciness: 0,
      overshootClamping: true
    }).start(() => {
      this._immediateIndex = null;
      const backFromScene = scenes.find((s: *) => s.index === toValue + 1);
      if (!this._isResponding && backFromScene) {
        this.animating = false;
        // navigation.dispatch(
        // props.onNavigateBack()
        // NavigationActions.back({ key: backFromScene.route.key }),
        // );
      }
    });
    props.onNavigateBack();
  }

  _addNativeListener(animatedValue) {
    if (!animatedValue.__isNative) {
      return;
    }

    if (Object.keys(animatedValue._listeners).length === 0) {
      animatedValue.addListener(emptyFunction);
    }
  }
}

function createPanHandlers(
  direction: NavigationGestureDirection,
  props: Props,
): NavigationPanPanHandlers {
  const responder = new NavPanResponder(direction, props);
  return responder.panHandlers;
}

function forHorizontal(
  props: Props,
): NavigationPanPanHandlers {
  return createPanHandlers(Directions.HORIZONTAL, props);
}

function forVertical(
  props: Props,
): NavigationPanPanHandlers {
  return createPanHandlers(Directions.VERTICAL, props);
}

module.exports = {
  // constants
  ANIMATION_DURATION,
  DISTANCE_THRESHOLD,
  POSITION_THRESHOLD,
  RESPOND_THRESHOLD,

  // enums
  Directions,

  // methods.
  forHorizontal,
  forVertical,
};
